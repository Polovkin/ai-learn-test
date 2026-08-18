import type { RequestHandler } from 'express'
import { HttpError } from '../../shared/http-errors.js'
import { verifyAccessToken } from './auth.service.js'
import type { AuthenticatedUser } from './auth.types.js'

export type AuthenticatedRequest = Express.Request & {
  user: AuthenticatedUser
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Access token missing'))
    return
  }

  try {
    ;(req as AuthenticatedRequest).user = verifyAccessToken(authorization.slice('Bearer '.length))
    next()
  } catch (error) {
    next(error)
  }
}
