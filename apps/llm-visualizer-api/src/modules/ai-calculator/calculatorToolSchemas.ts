export const calculatorToolSchemas = [
  {
    type: 'function' as const,
    name: 'calculateCalories',
    strict: true,
    description: 'Calculate burned calories from weight in kilograms and distance in kilometers.',
    parameters: {
      type: 'object',
      properties: {
        weightKg: {
          type: 'number',
          description: 'Body weight in kilograms.',
        },
        distanceKm: {
          type: 'number',
          description: 'Distance walked in kilometers.',
        },
      },
      required: ['weightKg', 'distanceKm'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'calculateTravelTime',
    strict: true,
    description: 'Calculate travel time from distance in kilometers and speed in km/h.',
    parameters: {
      type: 'object',
      properties: {
        distanceKm: {
          type: 'number',
          description: 'Travel distance in kilometers.',
        },
        speedKmH: {
          type: 'number',
          description: 'Travel speed in kilometers per hour.',
        },
      },
      required: ['distanceKm', 'speedKmH'],
      additionalProperties: false,
    },
  },
  {
    type: 'function' as const,
    name: 'convertCurrency',
    strict: true,
    description: 'Convert amount using a provided exchange rate.',
    parameters: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Source amount to convert.',
        },
        rate: {
          type: 'number',
          description: 'Exchange rate multiplier.',
        },
      },
      required: ['amount', 'rate'],
      additionalProperties: false,
    },
  },
]
