import type {
  CalculateCaloriesArgs,
  CalculateCaloriesResult,
  CalculateTravelTimeArgs,
  CalculateTravelTimeResult,
  ConvertCurrencyArgs,
  ConvertCurrencyResult,
} from './calculator.types.js'

export const calculateCalories = ({
  weightKg,
  distanceKm,
}: CalculateCaloriesArgs): CalculateCaloriesResult => {
  const calories = Math.round(weightKg * distanceKm * 1.036)
  return { calories }
}

export const calculateTravelTime = ({
  distanceKm,
  speedKmH,
}: CalculateTravelTimeArgs): CalculateTravelTimeResult => {
  const hoursFloat = distanceKm / speedKmH
  const totalMinutes = Math.round(hoursFloat * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return { hours, minutes }
}

export const convertCurrency = ({ amount, rate }: ConvertCurrencyArgs): ConvertCurrencyResult => {
  const result = Math.round(amount * rate * 100) / 100
  return { result }
}
