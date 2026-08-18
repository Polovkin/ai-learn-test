export type JwtPayload = {
  sub: number
  email: string
  type: 'access' | 'refresh'
}

export type AuthenticatedUser = {
  userId: number
  email: string
}
