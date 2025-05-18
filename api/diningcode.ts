// api/diningcode.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { name } = req.query
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: '식당명을 제공해야 합니다.' })
  }

  try {
    const searchUrl = `https://www.diningcode.com/list.php?query=${encodeURIComponent(name)}`
    const { data: html } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const match = html.match(/goProfile\('([^']+)'\)/)
    if (!match || !match[1]) {
      return res.status(404).json({ error: '상세 페이지 링크를 찾을 수 없습니다.' })
    }

    const profileUrl = `https://www.diningcode.com/profile.php?rid=${match[1]}`
    const { data: detailHtml } = await axios.get(profileUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    const $ = cheerio.load(detailHtml)
    const menus: { menu: string; price: string }[] = []

    $('.dc_menu li').each((_, el) => {
      const menu = $(el).find('.menu').text().trim()
      const price = $(el).find('.price').text().trim()
      if (menu) menus.push({ menu, price: price || '가격 정보 없음' })
    })

    res.status(200).json({ menus })
  } catch (err) {
    res.status(500).json({ error: '크롤링 실패', detail: (err as Error).message })
  }
}