export const FALLBACK_ACTIVATION_CONFIG = {
  key: 'nexlab-default',
  slug: 'nexlab-photo-opp',
  name: 'NEX.lab Photo Opp',
  theme: {
    accent: '#7057ff',
    accentSoft: '#f1ecff',
    accentContrast: '#ffffff',
    accentBorder: 'rgba(112,87,255,0.28)',
    accentMuted: 'rgba(112,87,255,0.16)',
    accentShadow: 'rgba(112,87,255,0.34)',
    shellTop: 'rgba(255,255,255,0.88)',
    shellBottom: 'rgba(230,227,221,0.72)',
    ambient: 'rgba(245,241,230,0.92)',
  },
  copy: {
    welcomeTitle: 'Photo Opp',
    welcomeDescription:
      'Prepare a câmera, conduza a captura e entregue a experiência completa com QR Code final.',
    reviewTitle: 'Sua foto está pronta',
    reviewDescription:
      'Revise em tela cheia e confirme antes de avançar para o QR Code.',
    shareTitle: 'Aponte a câmera do celular para o QR Code',
    shareDescription:
      'O visitante pode escanear agora e baixar a foto finalizada direto no telefone.',
    shareHint:
      'Se preferir, o promotor também pode abrir o link da foto e enviar direto pelo navegador.',
    thanksTitle: 'Obrigado!',
    thanksDescription:
      'O visitante já pode escanear o QR Code para baixar a foto final.',
    reactionTitle: 'Curtiu a foto?',
    reactionDescription: 'Essa foi sua foto no evento',
  },
  features: {
    reactionEnabled: false,
  },
  qrCode: {
    ttlSeconds: 900,
  },
  defaultFrameValue: 'NEXLAB FIGMA',
  frameOptions: [
    {
      value: 'NEXLAB FIGMA',
      label: 'NEXLAB Figma',
      assetUrl: '/event-assets/nexlab-default/frame-overlay.svg',
      outputWidth: 1080,
      outputHeight: 1920,
      window: {
        x: 68,
        y: 263,
        width: 944,
        height: 1537,
        background: '#1f1f1f',
      },
    },
  ],
}

export function getFrameOptions(eventConfig = FALLBACK_ACTIVATION_CONFIG) {
  return eventConfig?.frameOptions?.length
    ? eventConfig.frameOptions
    : FALLBACK_ACTIVATION_CONFIG.frameOptions
}

export function getDefaultFrameValue(eventConfig = FALLBACK_ACTIVATION_CONFIG) {
  return (
    eventConfig?.defaultFrameValue ||
    getFrameOptions(eventConfig)[0]?.value ||
    FALLBACK_ACTIVATION_CONFIG.defaultFrameValue
  )
}

export function getFrameOption(eventConfig = FALLBACK_ACTIVATION_CONFIG, frameValue) {
  const frameOptions = getFrameOptions(eventConfig)
  const fallbackValue = getDefaultFrameValue(eventConfig)

  return (
    frameOptions.find((option) => option.value === frameValue) ||
    frameOptions.find((option) => option.value === fallbackValue) ||
    frameOptions[0]
  )
}
