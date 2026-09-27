/**
 * Reduz a imagem enviada no admin e devolve como data URL, pra caber no banco
 * local (o localStorage guarda uns 5 MB por site).
 */
export function imageToDataUrl(file: File, maxSize = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Não deu pra processar essa imagem.'))
        return
      }
      // Fundo branco, igual ao do card: PNG transparente não fica preto no JPEG.
      ctx.fillStyle = '#FEFEFE'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não deu pra ler essa imagem.'))
    }
    img.src = url
  })
}
