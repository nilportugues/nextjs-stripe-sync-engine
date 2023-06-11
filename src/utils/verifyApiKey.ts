import { getConfig } from './config'
import { NextRequest } from 'next/server'

const config = getConfig()

export const verifyApiKey = (request: NextRequest): { code: number; data: string | null } => {
  if (!request.headers || !request.headers.get('Authorization')) {
    return { code: 401, data: 'Unauthorized' }
  }
  const authorization = request.headers.get('Authorization')
  if (authorization !== config.API_KEY) {
    return { code: 401, data: 'Unauthorized' }
  }

  return { code: 200, data: null }
}
