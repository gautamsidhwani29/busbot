import { runLKH3 } from "./lkh3Interface"
import type { BusStop, Depot } from "../types/types"

function generateLKH3Input(stops: BusStop[], depot: Depot): string {
  const allPoints = [depot, ...stops]
  const dimension = allPoints.length

  let input = `NAME : bus_route
TYPE : TSP
DIMENSION : ${dimension}
EDGE_WEIGHT_TYPE : EUC_2D
NODE_COORD_SECTION
`

  allPoints.forEach((point, index) => {
    input += `${index + 1} ${point.latitude} ${point.longitude}\n`
  })

  input += "EOF"
  return input
}

async function solveTSPWithLKH3(stops: BusStop[], depot: Depot): Promise<number[]> {
  const input = generateLKH3Input(stops, depot)
  const result = await runLKH3(input)

  // Parse the LKH-3 output to extract the tour
  const tourRegex = /TOUR_SECTION\s+([\d\s]+)/
  const match = result.match(tourRegex)
  if (!match) throw new Error("Failed to parse LKH-3 output")

  const tour = match[1].trim().split(/\s+/).map(Number)
  return tour.slice(0, -1) // Remove the last element (it's a duplicate of the first)
}

export async function optimizeRouteWithLKH3(stops: BusStop[], depot: Depot): Promise<BusStop[]> {
  const tour = await solveTSPWithLKH3(stops, depot)
  const allPoints = [depot, ...stops]

  // Reorder stops based on the tour (skipping the depot)
  const optimizedStops = tour.slice(1).map((index) => allPoints[index - 1] as BusStop)

  return optimizedStops
}

