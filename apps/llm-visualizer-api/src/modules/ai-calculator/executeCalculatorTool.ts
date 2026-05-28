import {
  calculateCalories,
  calculateTravelTime,
  convertCurrency,
} from './calculatorTools.js'
import type {
  CalculateCaloriesArgs,
  CalculateTravelTimeArgs,
  CalculatorToolArgsMap,
  CalculatorToolName,
  CalculatorToolResultMap,
  ConvertCurrencyArgs,
} from './calculator.types.js'

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const getRequiredNumber = (obj: Record<string, unknown>, key: string): number => {
  const value = obj[key]

  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid arguments: "${key}" must be a number.`)
  }

  return value
}

const assertExactKeys = (obj: Record<string, unknown>, allowedKeys: string[]) => {
  const keys = Object.keys(obj)
  const hasOnlyAllowed = keys.every((key) => allowedKeys.includes(key))
  const hasAllRequired = allowedKeys.every((key) => keys.includes(key))

  if (!hasOnlyAllowed || !hasAllRequired) {
    throw new Error(`Invalid arguments: expected keys ${allowedKeys.join(', ')}.`)
  }
}

const parseCaloriesArgs = (input: unknown): CalculateCaloriesArgs => {
  if (!isObjectRecord(input)) {
    throw new Error('Invalid arguments: expected a JSON object.')
  }

  assertExactKeys(input, ['weightKg', 'distanceKm'])

  return {
    weightKg: getRequiredNumber(input, 'weightKg'),
    distanceKm: getRequiredNumber(input, 'distanceKm'),
  }
}

const parseTravelTimeArgs = (input: unknown): CalculateTravelTimeArgs => {
  if (!isObjectRecord(input)) {
    throw new Error('Invalid arguments: expected a JSON object.')
  }

  assertExactKeys(input, ['distanceKm', 'speedKmH'])

  const speedKmH = getRequiredNumber(input, 'speedKmH')

  if (speedKmH <= 0) {
    throw new Error('Invalid arguments: "speedKmH" must be greater than 0.')
  }

  return {
    distanceKm: getRequiredNumber(input, 'distanceKm'),
    speedKmH,
  }
}

const parseConvertCurrencyArgs = (input: unknown): ConvertCurrencyArgs => {
  if (!isObjectRecord(input)) {
    throw new Error('Invalid arguments: expected a JSON object.')
  }

  assertExactKeys(input, ['amount', 'rate'])

  return {
    amount: getRequiredNumber(input, 'amount'),
    rate: getRequiredNumber(input, 'rate'),
  }
}

const isCalculatorToolName = (value: string): value is CalculatorToolName => {
  return value === 'calculateCalories' || value === 'calculateTravelTime' || value === 'convertCurrency'
}

export const assertCalculatorToolName = (value: string): CalculatorToolName => {
  if (!isCalculatorToolName(value)) {
    throw new Error(`Unknown tool: "${value}".`)
  }

  return value
}

export const parseCalculatorToolArguments = <TName extends CalculatorToolName>(
  toolName: TName,
  args: unknown,
): CalculatorToolArgsMap[TName] => {
  switch (toolName) {
    case 'calculateCalories':
      return parseCaloriesArgs(args) as CalculatorToolArgsMap[TName]
    case 'calculateTravelTime':
      return parseTravelTimeArgs(args) as CalculatorToolArgsMap[TName]
    case 'convertCurrency':
      return parseConvertCurrencyArgs(args) as CalculatorToolArgsMap[TName]
  }
}

export const executeCalculatorTool = <TName extends CalculatorToolName>(
  toolName: TName,
  args: CalculatorToolArgsMap[TName],
): CalculatorToolResultMap[TName] => {
  const calculatorToolExecutors: {
    [K in CalculatorToolName]: (toolArgs: CalculatorToolArgsMap[K]) => CalculatorToolResultMap[K]
  } = {
    calculateTravelTime,
    calculateCalories,
    convertCurrency,
  }

  const executor = calculatorToolExecutors[toolName]

  if (!executor) {
    throw new Error(`Unknown tool: ${toolName}`)
  }

  return executor(args)
}
