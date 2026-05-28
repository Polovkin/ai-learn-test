export const MODELS = {
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4_1_MINI: 'gpt-4.1-mini',
} as const

export type Model = (typeof MODELS)[keyof typeof MODELS]
