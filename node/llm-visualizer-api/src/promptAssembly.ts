const systemInstruction = 'Всі відповіді мають бути суто корейською мовою. '

const fixedContext = [
  'This is a learning demo about prompt assembly.',
  'The user input is not sent directly to the model.',
  'First, the backend combines instructions, context, and the user question into one final prompt.',
].join('\n')

export const buildAssembledPrompt = (userQuestion: string) => `SYSTEM INSTRUCTION:
${systemInstruction}

FIXED CONTEXT:
${fixedContext}

USER QUESTION:
${userQuestion}`
