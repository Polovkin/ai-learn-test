import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { chunkText } from './rag.chunking.js'
import { createRagEmbedding } from './rag.embeddings.js'
import { insertRagChunk } from './rag.db.js'
import { logRagStep, previewText } from './rag.logger.js'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

export const ingestPdfDocument = async (params: {
  filePath: string
  documentName: string
}): Promise<{ documentName: string; chunksCount: number }> => {
  const startedAt = Date.now()

  logRagStep('document.resolve', 'Resolving PDF file path.', {
    inputFilePath: params.filePath,
    cwd: process.cwd(),
  })

  const resolvedPath = await resolveDocumentPath(params.filePath)

  logRagStep('document.resolve', 'PDF file path resolved.', {
    resolvedPath,
  })

  const fileBuffer = await fs.readFile(resolvedPath)

  logRagStep('document.read', 'PDF file was read from disk.', {
    bytes: fileBuffer.byteLength,
  })

  const parsedPdf = await pdfParse(fileBuffer)

  logRagStep('document.parse', 'PDF text was extracted with pdf-parse.', {
    pagesReportedByParser: parsedPdf.numpages,
    extractedTextLength: parsedPdf.text.length,
    textPreview: previewText(parsedPdf.text),
    pageCitationLimit: 'MVP stores page = 1 because this parser flow does not provide reliable page-level chunks.',
  })

  const chunks = chunkText(parsedPdf.text, { page: 1 })

  logRagStep('document.chunk', 'Extracted text was split into chunks.', {
    chunksCount: chunks.length,
  })

  for (const chunk of chunks) {
    logRagStep('document.embed', 'Creating embedding for chunk.', {
      documentName: params.documentName,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      contentLength: chunk.content.length,
      contentPreview: previewText(chunk.content),
    })

    const embedding = await createRagEmbedding(chunk.content)

    logRagStep('document.store', 'Saving embedded chunk to PostgreSQL.', {
      documentName: params.documentName,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      embeddingDimensions: embedding.length,
    })

    await insertRagChunk({
      documentName: params.documentName,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      embedding,
    })

    logRagStep('document.store', 'Chunk was saved to PostgreSQL.', {
      documentName: params.documentName,
      page: chunk.page,
      chunkIndex: chunk.chunkIndex,
    })
  }

  logRagStep('document.done', 'Document ingestion pipeline completed.', {
    documentName: params.documentName,
    chunksCount: chunks.length,
    durationMs: Date.now() - startedAt,
  })

  return {
    documentName: params.documentName,
    chunksCount: chunks.length,
  }
}

const resolveDocumentPath = async (filePath: string): Promise<string> => {
  const candidatePaths = getDocumentPathCandidates(filePath)

  logRagStep('document.resolve', 'Checking candidate PDF paths.', {
    candidatePaths,
  })

  for (const candidatePath of candidatePaths) {
    try {
      await fs.access(candidatePath)
      logRagStep('document.resolve', 'Found readable PDF candidate path.', {
        candidatePath,
      })
      return candidatePath
    } catch {
      // Try the next candidate path.
      logRagStep('document.resolve', 'PDF candidate path is not readable, trying next one.', {
        candidatePath,
      })
    }
  }

  throw new Error(`PDF file was not found. Checked paths: ${candidatePaths.join(', ')}`)
}

const getDocumentPathCandidates = (filePath: string): string[] => {
  if (path.isAbsolute(filePath)) {
    return [filePath]
  }

  const candidates = [
    path.resolve(process.cwd(), filePath),
    path.resolve(moduleDir, '../../', filePath),
    path.resolve(moduleDir, '../../../', filePath),
  ]

  return [...new Set(candidates)]
}
