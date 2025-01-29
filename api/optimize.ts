// pages/api/optimize.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { optimizeRoutesDynamic } from '../utils/lkh3'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { depots, stops, vehicles, timeSlice } = req.body
    const result = await optimizeRoutesDynamic(depots, stops, vehicles, timeSlice)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Optimization failed' })
  }
}