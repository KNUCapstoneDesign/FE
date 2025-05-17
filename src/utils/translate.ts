// src/utils/translate.ts
export async function translateToKoreanWithGoogle(texts: string[]): Promise<string[]> {
  const TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      source: 'en',
      target: 'ko',
      format: 'text',
    }),
  })

  const json = await response.json()
  return json.data.translations.map((t: { translatedText: string }) => t.translatedText)
}
