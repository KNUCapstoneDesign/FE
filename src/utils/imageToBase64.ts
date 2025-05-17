export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1] // 앞부분 제거
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
