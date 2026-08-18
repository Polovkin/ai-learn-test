import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { HttpError } from '../../shared/http-errors.js'
import { prisma } from '../../shared/prisma.js'
import type { JwtPayload } from './auth.types.js'

const getSecret = (name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') => {
  const secret = process.env[name]

  if (!secret) {
    throw new Error(`${name} is not configured`)
  }

  return secret
}

const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

export const signAccessToken = (userId: number, email: string) => {
  const payload: JwtPayload = { sub: userId, email, type: 'access' }
  return jwt.sign(payload, getSecret('JWT_ACCESS_SECRET'), { expiresIn: '5s' })
}

const signRefreshToken = (userId: number, email: string) => {
  const payload: JwtPayload = { sub: userId, email, type: 'refresh' }
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), { expiresIn: '30s' })
}

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email)

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid credentials')
  }

  return {
    accessToken: signAccessToken(user.id, user.email),
    refreshToken: signRefreshToken(user.id, user.email),
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  }
}

export const verifyRefreshToken = (token: string) => {
  try {
    const payload = jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as JwtPayload

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    return payload
  } catch {
    throw new HttpError(401, 'Invalid or expired refresh token')
  }
}

export const verifyAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, getSecret('JWT_ACCESS_SECRET')) as JwtPayload

    if (payload.type !== 'access') {
      throw new Error('Invalid token type')
    }

    return { userId: payload.sub, email: payload.email }
  } catch {
    throw new HttpError(401, 'Access token invalid or expired')
  }
}
