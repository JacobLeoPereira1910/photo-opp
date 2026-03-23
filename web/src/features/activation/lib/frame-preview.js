import { FALLBACK_ACTIVATION_CONFIG, getFrameOption } from './frame-presets.js'

function getApiOrigin() {
  const apiUrl = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

  try {
    return new URL(apiUrl).origin
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

function resolveFrameAssetUrl(url) {
  if (!url) {
    return url
  }

  try {
    return new URL(url).toString()
  } catch {
    const apiOrigin = getApiOrigin()
    return apiOrigin ? new URL(url, `${apiOrigin}/`).toString() : url
  }
}

async function loadImageFromBlob(blob) {
  if ('createImageBitmap' in window) {
    return createImageBitmap(blob)
  }

  const url = URL.createObjectURL(blob)

  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = reject
      element.src = url
    })

    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = resolveFrameAssetUrl(url)
  })
}

export function getFrameOverlayUrl(eventConfig, frameName) {
  return resolveFrameAssetUrl(
    getFrameOption(eventConfig || FALLBACK_ACTIVATION_CONFIG, frameName).assetUrl,
  )
}

export async function createFramedPreviewBlobFromConfig(sourceBlob, eventConfig, frameName) {
  const frame = getFrameOption(eventConfig || FALLBACK_ACTIVATION_CONFIG, frameName)
  const source = await loadImageFromBlob(sourceBlob)
  const canvas = document.createElement('canvas')

  canvas.width = frame.outputWidth
  canvas.height = frame.outputHeight

  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = frame.window.background || '#1f1f1f'
  context.fillRect(frame.window.x, frame.window.y, frame.window.width, frame.window.height)

  const sourceWidth = source.width || frame.window.width
  const sourceHeight = source.height || frame.window.height
  const scale = Math.min(frame.window.width / sourceWidth, frame.window.height / sourceHeight)
  const drawWidth = Math.round(sourceWidth * scale)
  const drawHeight = Math.round(sourceHeight * scale)
  const drawX = frame.window.x + Math.round((frame.window.width - drawWidth) / 2)
  const drawY = frame.window.y + Math.round((frame.window.height - drawHeight) / 2)

  context.drawImage(source, drawX, drawY, drawWidth, drawHeight)

  const overlay = await loadImageFromUrl(frame.assetUrl)
  context.drawImage(overlay, 0, 0, frame.outputWidth, frame.outputHeight)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.96)
  })
}
