export async function mockActivationCamera(page) {
  await page.addInitScript(() => {
    const sourceCanvas = document.createElement('canvas')
    sourceCanvas.width = 64
    sourceCanvas.height = 64
    const sourceContext = sourceCanvas.getContext('2d')
    sourceContext.fillStyle = '#111111'
    sourceContext.fillRect(0, 0, 64, 64)
    sourceContext.fillStyle = '#f5f5f4'
    sourceContext.fillRect(8, 8, 48, 48)

    const pngBase64 = sourceCanvas.toDataURL('image/png').split(',')[1]
    const bytes = Uint8Array.from(atob(pngBase64), (char) => char.charCodeAt(0))

    const createPngBlob = (type = 'image/png') => new Blob([bytes], { type })

    const track = {
      stop() {},
      getSettings() {
        return {
          deviceId: 'mock-camera-1',
        }
      },
    }

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        async getUserMedia() {
          const stream = new MediaStream()
          stream.getTracks = () => [track]
          stream.getVideoTracks = () => [track]
          return stream
        },
        async enumerateDevices() {
          return [
            {
              kind: 'videoinput',
              deviceId: 'mock-camera-1',
              label: 'Mock Camera',
            },
          ]
        },
        addEventListener() {},
        removeEventListener() {},
      },
    })

    navigator.vibrate = () => true

    HTMLMediaElement.prototype.play = async function play() {
      Object.defineProperty(this, 'videoWidth', {
        configurable: true,
        get: () => 1080,
      })
      Object.defineProperty(this, 'videoHeight', {
        configurable: true,
        get: () => 1920,
      })

      return Promise.resolve()
    }

    const originalGetContext = HTMLCanvasElement.prototype.getContext

    HTMLCanvasElement.prototype.getContext = function getContext(...args) {
      const context = originalGetContext.apply(this, args)

      if (context && !context.__photoOppSafeDraw) {
        const originalDrawImage = context.drawImage.bind(context)

        context.drawImage = (...drawArgs) => {
          try {
            return originalDrawImage(...drawArgs)
          } catch {
            return undefined
          }
        }

        context.__photoOppSafeDraw = true
      }

      return context
    }

    HTMLCanvasElement.prototype.toBlob = function toBlob(callback, type) {
      callback(createPngBlob(type || 'image/png'))
    }
  })
}
