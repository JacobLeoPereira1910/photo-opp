import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CameraOff, FlipHorizontal, RefreshCcw, Smartphone } from 'lucide-react'
import { ActivationSessionActions } from '../components/layout/activation-session-actions.jsx'
import { PhoneShell } from '../components/layout/phone-shell.jsx'
import { Button } from '../components/ui/button.jsx'
import { Spinner } from '../components/ui/spinner.jsx'
import { cn } from '../lib/cn.js'
import { ActivationFlowSteps } from '../features/activation/components/activation-flow-steps.jsx'
import { StatusToast } from '../features/activation/components/status-toast.jsx'
import { useActivationFlow } from '../features/activation/context/activation-flow-context.jsx'
import { createFramedPreviewBlobFromConfig, getFrameOverlayUrl } from '../features/activation/lib/frame-preview.js'
import {
  getDefaultFrameValue,
  getFrameOptions,
} from '../features/activation/lib/frame-presets.js'

const TIMER_OPTIONS = [3, 5, 10]
const INITIAL_STATE = {
  status: 'opening',
  countdown: null,
  countdownRunId: 0,
  cameraError: '',
  selectedTimer: TIMER_OPTIONS[0],
  selectedFrame: '',
  isFlashing: false,
  isMirrored: true,
  availableCameras: [],
  selectedCameraId: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'camera/opening':
      return {
        ...state,
        status: 'opening',
        cameraError: '',
      }
    case 'camera/ready':
      return {
        ...state,
        status: 'ready',
      }
    case 'camera/error':
      return {
        ...state,
        status: 'error',
        cameraError: action.message,
      }
    case 'capture/start':
      return {
        ...state,
        countdown: action.seconds,
        countdownRunId: state.countdownRunId + 1,
      }
    case 'capture/tick':
      return {
        ...state,
        countdown: Math.max(1, (state.countdown || 1) - 1),
      }
    case 'capture/clear':
      return {
        ...state,
        countdown: null,
      }
    case 'capture/processing':
      return {
        ...state,
        status: 'processing',
      }
    case 'capture/flash':
      return {
        ...state,
        isFlashing: action.value,
      }
    case 'controls/timer':
      return {
        ...state,
        selectedTimer: action.value,
      }
    case 'controls/frame':
      return {
        ...state,
        selectedFrame: action.value,
      }
    case 'controls/mirror':
      return {
        ...state,
        isMirrored: !state.isMirrored,
      }
    case 'camera/devices':
      return {
        ...state,
        availableCameras: action.devices,
        selectedCameraId: action.selectedCameraId ?? state.selectedCameraId,
      }
    case 'camera/select-device':
      return {
        ...state,
        selectedCameraId: action.deviceId,
      }
    default:
      return state
  }
}

async function blobFromVideo(videoElement) {
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight

  const context = canvas.getContext('2d')
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png', 0.95)
  })
}

function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern)
  }
}

function getCameraErrorMessage(error) {
  switch (error?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'A permissão da câmera foi negada. Libere o acesso no navegador para continuar.'
    case 'NotFoundError':
      return 'Nenhuma câmera foi encontrada neste dispositivo.'
    case 'NotReadableError':
      return 'A câmera parece estar em uso por outro aplicativo. Feche o app concorrente e tente novamente.'
    case 'OverconstrainedError':
      return 'A câmera selecionada não atende aos requisitos atuais. Troque de câmera e tente novamente.'
    default:
      return error?.message || 'Autorize a câmera para continuar o fluxo.'
  }
}

export function ActivationCameraPage() {
  const navigate = useNavigate()
  const backgroundVideoRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [overlayState, setOverlayState] = useState('loading')
  const {
    eventConfig,
    configError,
    isOnline,
    retryConfig,
    localPreviewUrl,
    setLocalCapture,
    uploadCapture,
    retryUpload,
    cancelUpload,
    isUploading,
    uploadProgress,
    error,
    setError,
  } = useActivationFlow()

  const availableFrameOptions = getFrameOptions(eventConfig)
  const selectedFrameValue = state.selectedFrame || getDefaultFrameValue(eventConfig)
  const overlayUrl = useMemo(
    () => getFrameOverlayUrl(eventConfig, selectedFrameValue),
    [eventConfig, selectedFrameValue],
  )
  const isBackendReady = isOnline && !configError
  const isCaptureable = state.status === 'ready' && !isUploading && state.countdown === null && isBackendReady
  const activeCamera = state.availableCameras.find((camera) => camera.deviceId === state.selectedCameraId)
  const captureRingRadius = 35
  const captureRingLength = 2 * Math.PI * captureRingRadius

  useEffect(() => {
    if (!state.selectedFrame) {
      dispatch({ type: 'controls/frame', value: getDefaultFrameValue(eventConfig) })
    }
  }, [eventConfig, state.selectedFrame])

  useEffect(() => {
    setOverlayState('loading')
  }, [overlayUrl])

  useEffect(() => {
    let active = true

    async function syncAvailableDevices(preferredDeviceId) {
      if (!navigator.mediaDevices?.enumerateDevices) {
        return
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((device) => device.kind === 'videoinput')

      if (!active) {
        return
      }

      const fallbackDeviceId = preferredDeviceId || cameras[0]?.deviceId || ''

      dispatch({
        type: 'camera/devices',
        devices: cameras,
        selectedCameraId: fallbackDeviceId,
      })
    }

    async function startCamera() {
      try {
        dispatch({ type: 'camera/opening' })
        setError(null)

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('A câmera requer HTTPS. Acesse via localhost ou configure um certificado SSL.')
        }

        streamRef.current?.getTracks().forEach((track) => track.stop())

        const constraints = state.selectedCameraId
          ? {
              audio: false,
              video: {
                deviceId: { exact: state.selectedCameraId },
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
            }
          : {
              audio: false,
              video: {
                facingMode: 'user',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
            }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (backgroundVideoRef.current) {
          backgroundVideoRef.current.srcObject = stream
          backgroundVideoRef.current.play().catch(() => {})
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        const videoTrack = stream.getVideoTracks()[0]
        await syncAvailableDevices(videoTrack?.getSettings?.().deviceId)
        dispatch({ type: 'camera/ready' })
      } catch (cameraOpenError) {
        dispatch({
          type: 'camera/error',
          message: getCameraErrorMessage(cameraOpenError),
        })
      }
    }

    startCamera()

    navigator.mediaDevices?.addEventListener?.('devicechange', syncAvailableDevices)

    return () => {
      active = false
      navigator.mediaDevices?.removeEventListener?.('devicechange', syncAvailableDevices)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [setError, state.selectedCameraId])

  useEffect(() => {
    if (state.countdown === null) {
      return undefined
    }

    if (state.countdown > 1) {
      const timer = window.setTimeout(() => {
        vibrate(18)
        dispatch({ type: 'capture/tick' })
      }, 1000)

      return () => window.clearTimeout(timer)
    }

    const timer = window.setTimeout(async () => {
      dispatch({ type: 'capture/flash', value: true })
      window.setTimeout(() => dispatch({ type: 'capture/flash', value: false }), 450)
      dispatch({ type: 'capture/clear' })
      vibrate([35, 40, 70])

      try {
        dispatch({ type: 'capture/processing' })

        const rawBlob = await blobFromVideo(videoRef.current)

        if (!rawBlob) {
          throw new Error('Nao foi possivel capturar a imagem da camera.')
        }

        try {
          const previewBlob = await createFramedPreviewBlobFromConfig(rawBlob, eventConfig, selectedFrameValue)
          if (previewBlob) {
            setLocalCapture(previewBlob)
          } else {
            setLocalCapture(rawBlob)
          }
        } catch {
          setLocalCapture(rawBlob)
          setError({
            title: 'Preview sem moldura',
            description: 'A moldura não carregou no navegador, mas a foto seguirá para o backend com fallback local.',
            tone: 'warning',
          })
        }

        await uploadCapture(rawBlob, selectedFrameValue)

        startTransition(() => {
          navigate('/activation/review')
        })
      } catch (captureError) {
        if (!error) {
          setError({
            title: 'Falha na captura',
            description: captureError?.message || 'Não foi possível capturar a imagem da câmera.',
            tone: 'error',
          })
        }
        dispatch({ type: 'camera/ready' })
      }
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [error, eventConfig, navigate, selectedFrameValue, setError, setLocalCapture, state.countdown, uploadCapture])

  const handleCapture = useCallback(() => {
    if (!isCaptureable) {
      return
    }

    vibrate(25)
    dispatch({
      type: 'capture/start',
      seconds: state.selectedTimer,
    })
  }, [isCaptureable, state.selectedTimer])

  async function handleRetryUpload() {
    try {
      dispatch({ type: 'capture/processing' })
      await retryUpload()

      startTransition(() => {
        navigate('/activation/review')
      })
    } catch {
      dispatch({ type: 'camera/ready' })
    }
  }

  function handleCancelUpload() {
    cancelUpload()
    dispatch({ type: 'camera/ready' })
  }

  function handleSwitchCamera() {
    if (state.availableCameras.length < 2) {
      return
    }

    const currentIndex = state.availableCameras.findIndex((camera) => camera.deviceId === state.selectedCameraId)
    const nextCamera = state.availableCameras[(currentIndex + 1) % state.availableCameras.length]

    if (nextCamera) {
      dispatch({ type: 'camera/select-device', deviceId: nextCamera.deviceId })
    }
  }

  return (
    <PhoneShell footer="capture • frame • deliver" headerRight={<ActivationSessionActions />}>
      <div className="flex min-h-full flex-col gap-4">
        <ActivationFlowSteps currentStep="capture" />

        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Câmera aberta
          </p>
          <h1 className="font-display text-4xl font-semibold text-stone-950">
            Capture o momento
          </h1>
          <p className="text-sm leading-6 text-stone-500">
            Preview natural, sem crop agressivo. Ajuste o espelho e escolha a moldura antes do clique.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-stone-500">
          <div className="rounded-full border border-white/60 bg-white/70 px-3 py-2 text-center">
            {state.availableCameras.length || 1} câmera{state.availableCameras.length === 1 ? '' : 's'}
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'controls/mirror' })}
            className={cn(
              'rounded-full border px-3 py-2 text-center transition-colors',
              state.isMirrored
                ? ''
                : 'border-white/60 bg-white/70 hover:bg-white',
            )}
            style={
              state.isMirrored
                ? {
                    borderColor: 'var(--event-accent-border)',
                    backgroundColor: 'var(--event-accent-soft)',
                    color: 'var(--event-accent)',
                  }
                : undefined
            }
          >
            Espelho
          </button>
          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={state.availableCameras.length < 2}
            className="rounded-full border border-white/60 bg-white/70 px-3 py-2 text-center transition-colors hover:bg-white disabled:opacity-50"
          >
            Trocar
          </button>
        </div>

        <div className="relative w-full overflow-hidden rounded-[30px] border border-white/55 bg-stone-950 shadow-[0_30px_80px_-45px_rgba(0,0,0,0.65)]" style={{ aspectRatio: '9 / 16' }}>
          {state.status === 'error' ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-stone-100 px-8 text-center">
              <CameraOff className="size-10 text-stone-400" />
              <div className="space-y-2">
                <p className="font-display text-2xl font-semibold text-stone-900">
                  Câmera indisponível
                </p>
                <p className="text-sm leading-6 text-stone-500">{state.cameraError}</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCcw className="mr-2 size-4" />
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={backgroundVideoRef}
                className="absolute inset-0 h-full w-full object-cover opacity-40 blur-3xl"
                style={{ transform: state.isMirrored ? 'scale(-1.08, 1.08)' : 'scale(1.08)' }}
                autoPlay
                muted
                playsInline
              />
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-contain"
                style={{ transform: state.isMirrored ? 'scaleX(-1)' : 'none' }}
                autoPlay
                muted
                playsInline
              />

              <img
                src={overlayUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                onLoad={() => setOverlayState('ready')}
                onError={() => {
                  setOverlayState('error')
                  setError({
                    title: 'Moldura indisponível',
                    description: 'Não foi possível carregar a moldura oficial no preview. O servidor ainda tentará compor a versão final.',
                    tone: 'warning',
                  })
                }}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[15.5rem] w-[10.75rem] rounded-[999px] border-2 border-white/65 shadow-[0_0_0_9999px_rgba(0,0,0,0.16)]" />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
                <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
                  posicione seu rosto
                </span>
              </div>
            </>
          )}

          {state.status === 'opening' ? (
            <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
              <div className="text-center text-stone-600">
                <Spinner className="mx-auto mb-4 size-8" />
                <p className="font-display text-2xl font-semibold">Preparando câmera</p>
              </div>
            </div>
          ) : null}

          {state.countdown !== null ? (
            <div className="absolute inset-0 grid place-items-center">
              <div key={state.countdown} className="camera-countdown rounded-[32px] border border-white/25 bg-black/15 px-7 py-5 text-center backdrop-blur-[2px]">
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/70">
                  captura em
                </p>
                <p className="font-display text-8xl font-bold leading-none text-white drop-shadow-2xl">
                  {state.countdown}
                </p>
              </div>
            </div>
          ) : null}

          {state.status === 'processing' || isUploading ? (
            <div className="absolute inset-0 grid place-items-center bg-stone-950/48 backdrop-blur-md">
              <div className="w-[calc(100%-2rem)] max-w-[340px] rounded-[30px] border border-white/15 bg-black/55 p-4 text-center text-white shadow-[0_22px_60px_-30px_rgba(0,0,0,0.8)]">
                {localPreviewUrl ? (
                  <img
                    src={localPreviewUrl}
                    alt="Prévia da foto capturada"
                    className="mx-auto mb-4 max-h-52 rounded-[22px] border border-white/10 object-contain shadow-[0_20px_50px_-35px_rgba(255,255,255,0.22)]"
                  />
                ) : null}
                <Spinner className="mx-auto mb-3 size-8" />
                <p className="font-display text-2xl font-semibold">Preparando sua foto</p>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Aplicando a moldura e enviando o arquivo final.
                </p>
                <div className="mt-4 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#7c3aed,#a855f7)] transition-[width] duration-200"
                    style={{ width: `${Math.max(uploadProgress, 8)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[0.72rem] uppercase tracking-[0.18em] text-white/55">
                  <span>Upload</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 h-10 rounded-full border border-white/10 bg-white/10 px-4 text-white hover:bg-white/20"
                  onClick={handleCancelUpload}
                >
                  Cancelar envio
                </Button>
              </div>
            </div>
          ) : null}

          {state.isFlashing ? (
            <div className="camera-flash pointer-events-none absolute inset-0 bg-white" />
          ) : null}
        </div>

        {!isBackendReady ? (
          <StatusToast
            title={configError?.title || 'Sem conexão com o backend'}
            description={
              configError?.description ||
              'A captura fica bloqueada até a conexão com a API ser restabelecida.'
            }
            tone={configError?.tone || 'warning'}
            actionLabel="Recarregar config"
            onAction={retryConfig}
          />
        ) : null}

        {overlayState === 'error' && !error ? (
          <StatusToast
            title="Preview sem moldura"
            description="A câmera continua disponível, mas a moldura do navegador não foi carregada."
            tone="warning"
          />
        ) : null}

        {error ? (
          <StatusToast
            title={error.title}
            description={error.description}
            tone={error.tone}
            actionLabel={error.tone === 'error' ? 'Tentar novamente' : undefined}
            onAction={error.tone === 'error' ? handleRetryUpload : undefined}
            onDismiss={() => setError(null)}
          />
        ) : null}

        <div className="flex items-center justify-center py-1">
          <div className="relative">
            {isCaptureable ? (
              <div
                className="camera-capture-pulse pointer-events-none absolute -inset-2.5 rounded-full"
                style={{ backgroundColor: 'var(--event-accent-muted)' }}
              />
            ) : null}

            <svg
              className="pointer-events-none absolute -inset-3 size-[104px] -rotate-90"
              viewBox="0 0 88 88"
              aria-hidden="true"
            >
              <circle cx="44" cy="44" r={captureRingRadius} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4" />
              {state.countdown !== null ? (
                <circle
                  key={state.countdownRunId}
                  cx="44"
                  cy="44"
                  r={captureRingRadius}
                  fill="none"
                  stroke="var(--event-accent)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={captureRingLength}
                  strokeDashoffset={captureRingLength}
                  className="camera-progress-ring"
                  style={{
                    '--camera-ring-length': captureRingLength,
                    '--camera-progress-duration': `${state.selectedTimer}s`,
                  }}
                />
              ) : null}
            </svg>

            <div
              className="rounded-full p-[3px] transition-all duration-300"
              style={{
                background: isCaptureable
                  ? 'linear-gradient(135deg, var(--event-accent), color-mix(in srgb, var(--event-accent) 78%, white))'
                  : 'linear-gradient(135deg, #a8a29e, #d6d3d1)',
                boxShadow: isCaptureable ? '0 14px 44px -10px var(--event-accent-shadow)' : 'none',
              }}
            >
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isCaptureable}
                aria-label="Capturar foto"
                data-testid="capture-button"
                className="flex size-20 items-center justify-center rounded-full bg-stone-900 transition-all duration-150 hover:bg-stone-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <Camera className="size-8 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[132px_minmax(0,1fr)] gap-3">
          <div className="rounded-[22px] border border-white/55 bg-white/60 px-4 py-3">
            <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-stone-400">
              Timer
            </p>
            <div className="space-y-1.5">
              {TIMER_OPTIONS.map((timer) => (
                <button
                  key={timer}
                  type="button"
                  onClick={() => dispatch({ type: 'controls/timer', value: timer })}
                  className={cn(
                    'flex w-full items-center justify-between rounded-full px-3 py-2 text-sm font-semibold transition-all duration-150',
                    state.selectedTimer === timer
                      ? 'text-white shadow-sm'
                      : 'bg-white/80 text-stone-500 hover:bg-white',
                  )}
                  style={
                    state.selectedTimer === timer
                      ? {
                          backgroundColor: 'var(--event-accent)',
                        }
                      : undefined
                  }
                >
                  <span>{timer}s</span>
                  {state.selectedTimer === timer ? <span>●</span> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/55 bg-white/60 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Moldura
              </p>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
                {availableFrameOptions.length} estilos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {availableFrameOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => dispatch({ type: 'controls/frame', value })}
                  className={cn(
                    'overflow-hidden rounded-[20px] border p-1.5 text-left transition-all duration-150',
                    selectedFrameValue === value
                      ? ''
                      : 'border-stone-200 bg-white/90 hover:border-stone-300 hover:bg-white',
                  )}
                  style={
                    selectedFrameValue === value
                      ? {
                          borderColor: 'var(--event-accent-border)',
                          backgroundColor: 'var(--event-accent-soft)',
                          boxShadow: '0 16px 32px -26px var(--event-accent-shadow)',
                        }
                      : undefined
                  }
                >
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[15px] bg-[radial-gradient(circle_at_top,#fde68a40,transparent_42%),linear-gradient(180deg,#efeae4,#d6d1ca)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.36),transparent_58%)]" />
                    <img
                      src={getFrameOverlayUrl(eventConfig, value)}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-2">
                    <span className="text-[0.72rem] font-semibold text-stone-700">{label}</span>
                    {selectedFrameValue === value ? (
                      <span
                        className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: 'var(--event-accent)' }}
                      >
                        ativa
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'controls/mirror' })}
            className="flex items-center justify-center gap-2 rounded-[18px] border border-white/55 bg-white/60 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-white"
          >
            <FlipHorizontal className="size-4" />
            {state.isMirrored ? 'Espelho ligado' : 'Espelho desligado'}
          </button>

          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={state.availableCameras.length < 2}
            className="flex items-center justify-center gap-2 rounded-[18px] border border-white/55 bg-white/60 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-white disabled:opacity-50"
          >
            <Smartphone className="size-4" />
            {activeCamera?.label ? activeCamera.label.replace(/\s+\(.+\)$/, '') : 'Câmera atual'}
          </button>
        </div>
      </div>
    </PhoneShell>
  )
}
