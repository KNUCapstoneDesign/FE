interface LabelAnnotation {
  mid: string
  description: string
  score: number
  topicality: number
}

export async function analyzeImageWithVisionAPI(base64Image: string): Promise<string[]> {
  const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
        },
      ],
    }),
  })

  const json = await response.json()
  console.log('🌐 Vision API 응답:', JSON.stringify(json, null, 2))
  const labels: LabelAnnotation[] = json.responses?.[0]?.labelAnnotations || []
  return labels.map((l) => l.description)
}
