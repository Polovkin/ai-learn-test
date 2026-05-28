# Server

## Mini RAG setup

The RAG MVP requires PostgreSQL with the `pgvector` extension enabled. If your PostgreSQL instance does not support `pgvector`, run the server against a database that does; there is no fallback vector search implementation in this MVP.

Run the SQL from `src/modules/rag/rag.schema.sql` before using the RAG API.

Set `DATABASE_URL` and `OPENAI_API_KEY` before starting the server.

`pdf-parse` extracts text for the MVP, but it does not provide reliable page-level citations in this implementation. Ingested chunks currently store `page = 1` instead of exact PDF pages.

## Tool Calling Demo: Calculator API

This demo shows backend tool calling via API endpoint:

`client -> backend endpoint -> OpenAI tool selection -> local TypeScript function -> OpenAI final answer -> client`

Endpoint:

`POST /api/ai/calculator`

Request body:

```json
{
  "message": "Я важу 80 кг і пройшов 6 км. Скільки калорій?"
}
```

Response body example:

```json
{
  "answer": "Приблизно 497 ккал.",
  "toolCall": {
    "name": "calculateCalories",
    "arguments": {
      "weightKg": 80,
      "distanceKm": 6
    },
    "result": {
      "calories": 497
    }
  }
}
```

If model does not call a tool:

```json
{
  "answer": "Коротка відповідь моделі...",
  "toolCall": null
}
```

### Run

1. Set env variables:
`OPENAI_API_KEY=...`
`DATABASE_URL=...` (required by current server bootstrap because RAG schema initializes on startup)
2. Start API:
`npm run dev`

### Manual checks (curl)

```bash
curl -X POST http://localhost:3000/api/ai/calculator \
  -H "Content-Type: application/json" \
  -d '{"message":"Я важу 80 кг і пройшов 6 км. Скільки калорій?"}'
```

Expected:
- `toolCall.name = calculateCalories`
- `toolCall.result.calories = 497`

```bash
curl -X POST http://localhost:3000/api/ai/calculator \
  -H "Content-Type: application/json" \
  -d '{"message":"Скільки часу займе 120 км при швидкості 60 км/год?"}'
```

Expected:
- `toolCall.name = calculateTravelTime`
- `toolCall.result.hours = 2`
- `toolCall.result.minutes = 0`

```bash
curl -X POST http://localhost:3000/api/ai/calculator \
  -H "Content-Type: application/json" \
  -d '{"message":"Скільки буде 100 доларів по курсу 40?"}'
```

Expected:
- `toolCall.name = convertCurrency`
- `toolCall.result.result = 4000`

## Related\n- [Apps Overview](../README.md)\n- [Node.js Map](../../knowledge-base/maps/node.md)\n- [LLM Map](../../knowledge-base/maps/llm.md)
