import { Router } from 'express'
import { asyncHandler, HttpError } from '../../shared/http-errors.js'
import { requireAuth, type AuthenticatedRequest } from './auth.middleware.js'
import { login, signAccessToken, verifyRefreshToken } from './auth.service.js'

const router = Router()

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}

    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new HttpError(400, 'email and password are required')
    }

    const result = await login(email, password)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
    res.json({ accessToken: result.accessToken, user: result.user })
  }),
)

router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  if (typeof refreshToken !== 'string') {
    throw new HttpError(401, 'Missing refresh token')
  }

  const payload = verifyRefreshToken(refreshToken)
  res.json({ accessToken: signAccessToken(payload.sub, payload.email) })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken', { path: '/' })
  res.json({ success: true })
})

router.get('/me', requireAuth, (req, res) => {
  const { userId, email } = (req as AuthenticatedRequest).user
  res.json({ id: userId, email })
})

export default router
