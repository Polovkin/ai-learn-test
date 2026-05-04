export const MODELS = {
  GPT_4_1_MINI: 'gpt-4.1-mini',
} as const

export type Model = (typeof MODELS)[keyof typeof MODELS]
