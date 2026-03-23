import { env } from './env.js';

const EVENT_ASSET_PREFIX = '/event-assets';
const DEFAULT_EVENT_KEY = 'nexlab-default';

const BASE_EVENT_CONFIGS = {
  'nexlab-default': {
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
      ambient: 'rgba(245,241,230,0.92)'
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
      reactionDescription: 'Essa foi sua foto no evento'
    },
    features: {
      reactionEnabled: true
    },
    qrCode: {
      ttlSeconds: 900
    },
    defaultFrameValue: 'NEXLAB FIGMA',
    frameOptions: [
      {
        value: 'NEXLAB FIGMA',
        label: 'NEXLAB Figma',
        assetFile: 'nexlab-default/frame-overlay.svg',
        outputWidth: 1080,
        outputHeight: 1920,
        background: '#ffffff',
        window: {
          x: 68,
          y: 263,
          width: 944,
          height: 1537,
          background: '#1f1f1f'
        }
      }
    ]
  }
};

function buildFrameOption(option) {
  return {
    ...option,
    assetUrl: `${EVENT_ASSET_PREFIX}/${option.assetFile}`
  };
}

const EVENT_CONFIGS = Object.fromEntries(
  Object.entries(BASE_EVENT_CONFIGS).map(([key, config]) => [
    key,
    {
      ...config,
      frameOptions: config.frameOptions.map(buildFrameOption)
    }
  ])
);

export function getActiveEventConfig() {
  return EVENT_CONFIGS[env.ACTIVE_EVENT_KEY] || EVENT_CONFIGS[DEFAULT_EVENT_KEY];
}

export function resolveFrameOption(eventConfig, frameValue) {
  const frameOptions = eventConfig?.frameOptions || [];
  const fallback =
    frameOptions.find((item) => item.value === eventConfig?.defaultFrameValue) ||
    frameOptions[0] ||
    null;

  if (!frameValue) {
    return fallback;
  }

  return frameOptions.find((item) => item.value === frameValue) || fallback;
}

export function sanitizeEventConfigForClient(eventConfig) {
  return {
    key: eventConfig.key,
    slug: eventConfig.slug,
    name: eventConfig.name,
    theme: eventConfig.theme,
    copy: eventConfig.copy,
    features: eventConfig.features,
    qrCode: eventConfig.qrCode,
    defaultFrameValue: eventConfig.defaultFrameValue,
    frameOptions: eventConfig.frameOptions.map((option) => ({
      value: option.value,
      label: option.label,
      assetUrl: option.assetUrl,
      outputWidth: option.outputWidth,
      outputHeight: option.outputHeight,
      window: option.window
    }))
  };
}
