function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatExpiry(expiresAt) {
  if (!expiresAt) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(expiresAt));
  } catch {
    return expiresAt;
  }
}

function getStateCopy(status) {
  if (status === 'ready') {
    return {
      title: 'Sua foto esta pronta',
      description:
        'Use o botao abaixo para baixar a foto final com a moldura oficial do evento.',
      badge: 'QR valido',
      tone: '#2563eb'
    };
  }

  if (status === 'expired') {
    return {
      title: 'Este QR Code expirou',
      description:
        'Volte ao promotor para gerar um novo acesso. O link de download nao fica disponivel apos a expiracao.',
      badge: 'Acesso expirado',
      tone: '#b45309'
    };
  }

  if (status === 'processing') {
    return {
      title: 'Sua foto ainda esta sendo preparada',
      description:
        'A captura foi recebida, mas o arquivo final ainda nao esta disponivel. Aguarde alguns instantes e tente novamente.',
      badge: 'Processando',
      tone: '#4f46e5'
    };
  }

  return {
    title: 'Nao encontramos esta foto',
    description:
      'Confira se o QR Code esta correto ou retorne ao promotor para gerar um novo acesso.',
    badge: 'Nao encontrado',
    tone: '#be123c'
  };
}

export function renderPublicPhotoAccessPage({
  status,
  eventName,
  downloadUrl,
  framedUrl,
  expiresAt
}) {
  const copy = getStateCopy(status);
  const formattedExpiry = formatExpiry(expiresAt);
  const hasDownload = status === 'ready' && downloadUrl;
  const pageTitle = `${copy.title} | ${eventName || 'Photo Opp'}`;

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #1c1917;
        background:
          radial-gradient(circle at top, rgba(251, 191, 36, 0.14), transparent 30%),
          linear-gradient(180deg, #f8f6f3 0%, #ede7df 100%);
      }

      .shell {
        width: min(100%, 480px);
        border-radius: 32px;
        padding: 24px;
        background: rgba(255, 255, 255, 0.94);
        border: 1px solid rgba(28, 25, 23, 0.08);
        box-shadow: 0 30px 80px -48px rgba(0, 0, 0, 0.34);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        background: color-mix(in srgb, ${copy.tone} 10%, white);
        color: ${copy.tone};
      }

      h1 {
        margin: 18px 0 10px;
        font-size: clamp(2rem, 7vw, 2.8rem);
        line-height: 0.95;
      }

      p {
        margin: 0;
        line-height: 1.7;
        color: #57534e;
      }

      .preview {
        margin: 22px 0;
        border-radius: 28px;
        padding: 14px;
        background: linear-gradient(180deg, rgba(250, 250, 249, 0.98), rgba(245, 245, 244, 0.86));
        border: 1px solid rgba(28, 25, 23, 0.08);
      }

      .preview img {
        width: 100%;
        aspect-ratio: 9 / 16;
        object-fit: cover;
        border-radius: 22px;
        background: #f5f5f4;
      }

      .meta {
        margin: 20px 0 0;
        padding: 14px 16px;
        border-radius: 22px;
        background: #fafaf9;
        border: 1px solid rgba(28, 25, 23, 0.08);
        font-size: 14px;
        color: #44403c;
      }

      .cta {
        margin-top: 22px;
        display: inline-flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        border-radius: 18px;
        padding: 16px 18px;
        background: #1c1917;
        color: white;
        text-decoration: none;
        font-weight: 700;
      }

      .helper {
        margin-top: 14px;
        font-size: 13px;
        text-align: center;
        color: #78716c;
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <div class="badge">${escapeHtml(copy.badge)}</div>
      <h1>${escapeHtml(copy.title)}</h1>
      <p>${escapeHtml(copy.description)}</p>
      ${
        framedUrl
          ? `<div class="preview"><img src="${escapeHtml(framedUrl)}" alt="Foto do evento" /></div>`
          : ''
      }
      <div class="meta">
        <strong>${escapeHtml(eventName || 'Photo Opp')}</strong>
        ${
          formattedExpiry
            ? `<div style="margin-top:8px;">Validade do QR: ${escapeHtml(formattedExpiry)}</div>`
            : ''
        }
      </div>
      ${
        hasDownload
          ? `<a class="cta" href="${escapeHtml(downloadUrl)}">Baixar foto final</a>`
          : ''
      }
      <p class="helper">Se precisar de um novo acesso, procure o promotor no ponto de ativacao.</p>
    </main>
  </body>
</html>`;
}
