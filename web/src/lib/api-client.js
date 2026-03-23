import axios from 'axios'
import { sessionStore } from './storage'

const API_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

function toQueryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    query.set(key, value)
  })

  const stringified = query.toString()
  return stringified ? `?${stringified}` : ''
}

export class ApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = details.statusCode
    this.code = details.code
    this.transportCode = details.transportCode
    this.details = details.details
  }
}

async function request(path, options = {}, config = {}) {
  try {
    const session = sessionStore.get()
    const headers = { ...(options.headers || {}) }

    if (config.auth && session?.token) {
      headers.authorization = `Bearer ${session.token}`
    }

    if (options.body && !(options.body instanceof FormData) && !headers['content-type']) {
      headers['content-type'] = 'application/json'
    }

    const response = await axios.request({
      url: `${API_URL}${path}`,
      method: options.method || 'GET',
      data: options.body,
      headers,
      signal: config.signal,
      onUploadProgress: config.onUploadProgress,
      responseType: config.responseType === 'text' ? 'text' : 'json',
      transformResponse:
        config.responseType === 'text'
          ? [(value) => value]
          : axios.defaults.transformResponse,
    })

    return response.data
  } catch (error) {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      throw new ApiError('Requisicao cancelada.', {
        statusCode: error.response?.status,
        code: 'REQUEST_CANCELED',
        transportCode: error.code,
      })
    }

    if (axios.isAxiosError(error)) {
      const payload = error.response?.data
      const message =
        typeof payload === 'string'
          ? payload
          : payload?.message || error.message || 'Request failed'

      throw new ApiError(message, {
        statusCode: error.response?.status,
        code: typeof payload === 'object' ? payload?.code : undefined,
        transportCode: error.code,
        details: typeof payload === 'object' ? payload?.details : undefined,
      })
    }

    throw error
  }
}

export const apiClient = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: credentials,
    })
  },

  me() {
    return request('/auth/me', {}, { auth: true })
  },

  requestPasswordReset(data) {
    return request('/auth/password-reset/request', {
      method: 'POST',
      body: data,
    })
  },

  verifyOtp(data) {
    return request('/auth/password-reset/verify-otp', {
      method: 'POST',
      body: data,
    })
  },

  confirmPasswordReset(data) {
    return request('/auth/password-reset/confirm', {
      method: 'POST',
      body: data,
    })
  },

  uploadActivationPhoto(formData, options = {}) {
    return request('/activation/photos', {
      method: 'POST',
      body: formData,
    }, {
      auth: true,
      signal: options.signal,
      onUploadProgress: options.onUploadProgress,
    })
  },

  getActivationPhoto(photoId) {
    return request(`/activation/photos/${photoId}`, {}, { auth: true })
  },

  getActivationPhotoQrCode(photoId) {
    return request(`/activation/photos/${photoId}/qrcode`, {}, { auth: true })
  },

  reactToActivationPhoto(photoId, reaction) {
    return request(`/activation/photos/${photoId}/reaction`, {
      method: 'PATCH',
      body: { reaction },
    }, { auth: true })
  },

  getActivationStats() {
    return request('/activation/stats', {})
  },

  getActivationConfig() {
    return request('/activation/config', {})
  },

  getActivationHistory() {
    return request('/activation/photos/history', {}, { auth: true })
  },

  getAdminMetrics(filters) {
    return request(`/admin/dashboard/metrics${toQueryString(filters)}`, {}, { auth: true })
  },

  listAdminPhotos(filters) {
    return request(`/admin/photos${toQueryString(filters)}`, {}, { auth: true })
  },

  getAdminPhoto(photoId) {
    return request(`/admin/photos/${photoId}`, {}, { auth: true })
  },

  getAdminPhotoQrCode(photoId) {
    return request(`/admin/photos/${photoId}/qrcode`, {}, { auth: true })
  },

  listAdminLogs(filters) {
    return request(`/admin/logs${toQueryString(filters)}`, {}, { auth: true })
  },

  exportAdminLogs(filters) {
    return request(`/admin/logs/export${toQueryString(filters)}`, {}, {
      auth: true,
      responseType: 'text',
    })
  },
}
