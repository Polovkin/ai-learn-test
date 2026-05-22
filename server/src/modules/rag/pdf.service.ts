import pdfParse from 'pdf-parse/lib/pdf-parse.js'

export const extractTextFromPdf = async (fileBuffer: Buffer): Promise<string> => {
  const parsedPdf = await pdfParse(fileBuffer)
  const text = parsedPdf.text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim()

  if (!text) {
    throw new Error('PDF does not contain extractable text')
  }

  return text
}
