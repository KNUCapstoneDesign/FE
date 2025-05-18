import { NextApiRequest, NextApiResponse } from 'next'
import * as cheerio from 'cheerio'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' })
  }

  try {
    const searchUrl = `https://www.diningcode.com/list.dc?query=${encodeURIComponent(name)}`
    const searchRes = await fetch(searchUrl)
    const searchHtml = await searchRes.text()
    const $search = cheerio.load(searchHtml)

    const firstShopPath = $search('.dc-restaurant-name').first().attr('href')
    if (!firstShopPath) {
      return res.status(404).json({ error: 'No restaurant found' })
    }

    const shopUrl = `https://www.diningcode.com${firstShopPath}`
    const shopRes = await fetch(shopUrl)
    const shopHtml = await shopRes.text()
    const $ = cheerio.load(shopHtml)

    const menus: { name: string; price: string }[] = []
    $('.info-menu-list .tit').each((i, el) => {
      const name = $(el).text().trim()
      const price = $(el).next('.price').text().trim()
      menus.push({ name, price })
    })

    return res.status(200).json({ menus })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to scrape', detail: err })
  }
}