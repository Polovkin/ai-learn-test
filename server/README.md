# Server

## Mini RAG setup

The RAG MVP requires PostgreSQL with the `pgvector` extension enabled. If your PostgreSQL instance does not support `pgvector`, run the server against a database that does; there is no fallback vector search implementation in this MVP.

Run the SQL from `src/rag/rag.schema.sql` before using the RAG API.

Set `DATABASE_URL` and `OPENAI_API_KEY` before starting the server.

`pdf-parse` extracts text for the MVP, but it does not provide reliable page-level citations in this implementation. Ingested chunks currently store `page = 1` instead of exact PDF pages.
