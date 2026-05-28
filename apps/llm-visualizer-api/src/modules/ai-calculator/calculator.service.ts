import { openAiClient } from '../../openAiClient.js'
import { MODELS } from '../../settings/ai.settings.js'
import { calculatorToolSchemas } from './calculatorToolSchemas.js'
import {
  assertCalculatorToolName,
  executeCalculatorTool,
  parseCalculatorToolArguments,
} from './executeCalculatorTool.js'
import type { CalculatorResponseDto } from './calculator.types.js'

const SYSTEM_INSTRUCTION =
  'You are a calculator assistant. If the user asks for calorie calculation, travel time calculation, or currency conversion, call the appropriate tool. Do not calculate these values yourself when a tool is available. After receiving the tool result, answer shortly in Ukrainian.'

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

type FunctionCallItem = {
  name: string
  arguments: string
  call_id: string
}

const extractResponseText = (response: { output_text?: string; output?: unknown[] }): string => {
  const directText = response.output_text?.trim()
  if (directText) {
    return directText
  }

  const aggregatedText = (response.output ?? [])
    .filter(isObjectRecord)
    .flatMap((item) => {
      const content = item.content
      return Array.isArray(content) ? content : []
    })
    .filter(isObjectRecord)
    .filter((item) => item.type === 'output_text' || item.type === 'text')
    .map((item) => (typeof item.text === 'string' ? item.text.trim() : ''))
    .filter(Boolean)
    .join('\n')
    .trim()

  return aggregatedText
}

const extractFunctionCall = (output: unknown[]) => {
  for (const item of output) {
    if (!isObjectRecord(item)) {
      continue
    }

    if (
      item.type === 'function_call' &&
      typeof item.name === 'string' &&
      typeof item.arguments === 'string' &&
      typeof item.call_id === 'string'
    ) {
      return {
        name: item.name,
        arguments: item.arguments,
        call_id: item.call_id,
      } satisfies FunctionCallItem
    }
  }

  return null
}

export const getCalculatorAnswer = async (message: string): Promise<CalculatorResponseDto> => {
  const firstResponse = await openAiClient.responses.create({
    model: MODELS.GPT_4O_MINI,
    stream: false,
    temperature: 0,
    tools: calculatorToolSchemas,
    input: [
      {
        role: 'system',
        content: SYSTEM_INSTRUCTION,
      },
      {
        role: 'user',
        content: message,
      },
    ],
  })

  const toolCall = extractFunctionCall(firstResponse.output ?? [])

  if (!toolCall) {
    return {
      answer: extractResponseText(firstResponse) || 'Не вдалося сформувати відповідь.',
      toolCall: null,
    }
  }

  const toolName = assertCalculatorToolName(toolCall.name)

  const rawArgs = JSON.parse(toolCall.arguments) as unknown
  const parsedArgs = parseCalculatorToolArguments(toolName, rawArgs)

  const toolResult = executeCalculatorTool(toolName, parsedArgs)

  const secondResponse = await openAiClient.responses.create({
    model: MODELS.GPT_4_1_MINI,
    stream: false,
    temperature: 0,
    previous_response_id: firstResponse.id,
    input: [
      {
        type: 'function_call_output',
        call_id: toolCall.call_id,
        output: JSON.stringify(toolResult),
      },
    ],
  })

  const answer = extractResponseText(secondResponse) || 'Не вдалося сформувати відповідь.'

  return {
    answer,
    toolCall: {
      name: toolName,
      arguments: parsedArgs,
      result: toolResult,
    },
  }
}
