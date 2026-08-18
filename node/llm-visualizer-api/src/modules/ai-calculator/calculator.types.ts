export type CalculatorToolName = 'calculateCalories' | 'calculateTravelTime' | 'convertCurrency'

export type CalculateCaloriesArgs = {
  weightKg: number
  distanceKm: number
}

export type CalculateTravelTimeArgs = {
  distanceKm: number
  speedKmH: number
}

export type ConvertCurrencyArgs = {
  amount: number
  rate: number
}

export type CalculateCaloriesResult = {
  calories: number
}

export type CalculateTravelTimeResult = {
  hours: number
  minutes: number
}

export type ConvertCurrencyResult = {
  result: number
}

export type CalculatorToolArgsMap = {
  calculateCalories: CalculateCaloriesArgs
  calculateTravelTime: CalculateTravelTimeArgs
  convertCurrency: ConvertCurrencyArgs
}

export type CalculatorToolResultMap = {
  calculateCalories: CalculateCaloriesResult
  calculateTravelTime: CalculateTravelTimeResult
  convertCurrency: ConvertCurrencyResult
}

export type CalculatorToolResult = CalculatorToolResultMap[CalculatorToolName]

export type CalculatorToolCallDebug = {
  name: CalculatorToolName
  arguments: CalculatorToolArgsMap[CalculatorToolName]
  result: CalculatorToolResult
}

export type CalculatorResponseDto = {
  answer: string
  toolCall: CalculatorToolCallDebug | null
}
