import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { apiClient } from '../../../lib/api-client'
import { FALLBACK_ACTIVATION_CONFIG, getDefaultFrameValue } from '../lib/frame-presets.js'
import { applyEventTheme } from '../../../lib/event-theme.js'

const ActivationFlowContext = createContext(null)
const RETRY_DELAYS_MS = [800, 1600]

function shouldRetryUpload(uploadError) {
  if (!uploadError) {
    return false
  }

  if (uploadError.code === 'REQUEST_CANCELED') {
    return false
  }

  return !uploadError.statusCode || uploadError.statusCode >= 500 || uploadError.transportCode === 'ERR_NETWORK'
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function buildConfigErrorState(isOnline) {
  if (!isOnline) {
    return {
      title: 'Sem internet',
      description: 'A ativação precisa de conexão para carregar a configuração do evento e enviar a foto.',
      tone: 'warning',
    }
  }

  return {
    title: 'Backend indisponível',
    description: 'Não foi possível carregar a configuração do evento. Verifique a API e tente novamente.',
    tone: 'warning',
  }
}

function buildUploadErrorState(uploadError, isOnline) {
  if (!isOnline || uploadError?.transportCode === 'ERR_NETWORK') {
    return {
      title: 'Servidor indisponível',
      description: 'Não foi possível alcançar a API. Confira a conexão ou reinicie o backend.',
      tone: 'warning',
    }
  }

  if (uploadError?.code === 'REQUEST_CANCELED') {
    return {
      title: 'Envio cancelado',
      description: 'O upload foi interrompido. Você pode tentar novamente.',
      tone: 'warning',
    }
  }

  if (uploadError?.code === 'IMAGE_TOO_LARGE') {
    return {
      title: 'Arquivo muito grande',
      description: uploadError.message || 'A imagem excede o limite permitido para upload.',
      tone: 'warning',
    }
  }

  if (
    uploadError?.code === 'INVALID_IMAGE_UPLOAD' ||
    uploadError?.code === 'UNSUPPORTED_IMAGE_MIME' ||
    uploadError?.code === 'IMAGE_MIME_MISMATCH'
  ) {
    return {
      title: 'Imagem inválida',
      description: uploadError.message || 'Envie uma imagem válida em PNG, JPG ou WEBP.',
      tone: 'warning',
    }
  }

  return {
    title: 'Falha ao processar a foto',
    description: uploadError?.message || 'Não foi possível processar a foto.',
    tone: 'error',
  }
}

export function ActivationFlowProvider({ children }) {
  const [eventConfig, setEventConfig] = useState(FALLBACK_ACTIVATION_CONFIG)
  const [isConfigLoading, setIsConfigLoading] = useState(true)
  const [configError, setConfigError] = useState(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null)
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const uploadControllerRef = useRef(null)
  const lastUploadRef = useRef(null)

  useEffect(() => {
    return () => {
      uploadControllerRef.current?.abort()
    }
  }, [])

  const loadActivationConfig = useCallback(async () => {
    const onlineState = typeof navigator === 'undefined' ? true : navigator.onLine

    setIsConfigLoading(true)
    setConfigError(null)

    try {
      const result = await apiClient.getActivationConfig()

      if (result?.event) {
        setEventConfig(result.event)
      }
    } catch {
      setConfigError(buildConfigErrorState(onlineState))
      setEventConfig(FALLBACK_ACTIVATION_CONFIG)
    } finally {
      setIsConfigLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivationConfig()
  }, [loadActivationConfig])

  useEffect(() => {
    applyEventTheme(eventConfig)
  }, [eventConfig])

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  function resetFlow() {
    uploadControllerRef.current?.abort()

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl)
    }

    setLocalPreviewUrl(null)
    setUploadedPhoto(null)
    setError(null)
    setIsUploading(false)
    setUploadProgress(0)
    lastUploadRef.current = null
  }

  function setLocalCapture(blob) {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl)
    }

    const previewUrl = URL.createObjectURL(blob)
    setLocalPreviewUrl(previewUrl)
  }

  async function performUpload(blob, frameName) {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
    lastUploadRef.current = { blob, frameName }

    try {
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        const controller = new AbortController()
        uploadControllerRef.current = controller

        try {
          const file = new File([blob], `photo-opp-${Date.now()}.png`, {
            type: 'image/png',
          })

          const formData = new FormData()
          formData.append('frameName', frameName)
          formData.append(
            'metadata',
            JSON.stringify({
              source: 'web-camera',
            }),
          )
          formData.append('file', file)

          const result = await apiClient.uploadActivationPhoto(formData, {
            signal: controller.signal,
            onUploadProgress: (event) => {
              if (!event.total) {
                return
              }

              setUploadProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)))
            },
          })

          setUploadedPhoto(result.photo)
          setUploadProgress(100)
          return result.photo
        } catch (uploadError) {
          if (!shouldRetryUpload(uploadError) || attempt === RETRY_DELAYS_MS.length) {
            throw uploadError
          }

          await wait(RETRY_DELAYS_MS[attempt])
        }
      }
    } catch (uploadError) {
      setError(buildUploadErrorState(uploadError, typeof navigator === 'undefined' ? isOnline : navigator.onLine))
      throw uploadError
    } finally {
      setIsUploading(false)
      uploadControllerRef.current = null
    }
  }

  async function uploadCapture(blob, frameName = getDefaultFrameValue(eventConfig)) {
    return performUpload(blob, frameName)
  }

  async function retryUpload() {
    if (!lastUploadRef.current) {
      return null
    }

    return performUpload(lastUploadRef.current.blob, lastUploadRef.current.frameName)
  }

  function cancelUpload() {
    uploadControllerRef.current?.abort()
  }

  const value = {
    eventConfig,
    isConfigLoading,
    configError,
    isOnline,
    localPreviewUrl,
    uploadedPhoto,
    isUploading,
    uploadProgress,
    error,
    retryConfig: loadActivationConfig,
    resetFlow,
    setLocalCapture,
    uploadCapture,
    retryUpload,
    cancelUpload,
    setError,
  }

  return (
    <ActivationFlowContext.Provider value={value}>
      {children}
    </ActivationFlowContext.Provider>
  )
}

export function useActivationFlow() {
  const context = useContext(ActivationFlowContext)

  if (!context) {
    throw new Error('useActivationFlow must be used within ActivationFlowProvider')
  }

  return context
}
