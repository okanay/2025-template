import { getHeaders, setCookie } from '@tanstack/react-start/server'
import { createServerFn } from '@tanstack/react-start'

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL

export const AuthFetch = async (url: string, options: RequestInit = {}) => {
  const clientHeaders = getHeaders()
  const criticalIpHeaders: HeadersInit = {
    'CF-Connecting-IP': clientHeaders['cf-connecting-ip'] || '',
    'X-Forwarded-For': clientHeaders['x-forwarded-for'] || '',
    'X-Real-IP': clientHeaders['x-real-ip'] || '',
    Cookie: clientHeaders['cookie'] || '',
  }

  const headersToForward = new Headers({ ...options.headers, ...criticalIpHeaders })

  // Backend'e fetch isteğini yap
  const backendResponse = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers: headersToForward,
  })

  if (backendResponse.headers.has('Set-Cookie')) {
    setCookie(backendResponse.headers.get('Set-Cookie')!, '')
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: backendResponse.headers,
  })
}

export const getIPAddress = createServerFn({
  method: 'GET',
  response: 'raw',
}).handler(async () => {
  const response = await AuthFetch(`/v1/test/ip-address`)
  return response
})
