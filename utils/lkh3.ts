import type { BusStop, Depot, Vehicle, TimeWindow, OptimizedRoute } from "../types/types"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import fetch from "node-fetch"

interface LKH3Config {
  vehicles: Vehicle[]
  depots: Depot[]
  stops: BusStop[]
  timeSlice: "AM" | "PM"
  maxTrials: number
  timeLimit: number
}

export function generateDynamicVRPFile(config: LKH3Config): string {
  const { depots, stops, vehicles, timeSlice } = config
  const allNodes = [...depots, ...stops]

  let vrpContent = `NAME: ${timeSlice}_SCHEDULE
TYPE: CVRPTW
DIMENSION: ${allNodes.length}
EDGE_WEIGHT_TYPE: EUC_2D
CAPACITY: ${vehicles[0].capacity}
DEPOT_SECTION\n`

  // Add depots
  depots.forEach((depot, index) => {
    vrpContent += `${index + 1} ${depot.latitude} ${depot.longitude}\n`
  })
  vrpContent += "-1\n"

  // Node coordinates section
  vrpContent += "NODE_COORD_SECTION\n"
  allNodes.forEach((node, index) => {
    vrpContent += `${index + 1} ${node.latitude} ${node.longitude}\n`
  })

  // Time windows section
  vrpContent += "TIME_WINDOW_SECTION\n"
  allNodes.forEach((node, index) => {
    const tw = getTimeWindowForSlice(node.timeWindows, timeSlice)
    vrpContent += `${index + 1} ${tw.start} ${tw.end}\n`
  })

  // Demand section
  vrpContent += "DEMAND_SECTION\n"
  allNodes.forEach((node, index) => {
    const demand = timeSlice === "AM" ? node.amDemand : node.pmDemand
    vrpContent += `${index + 1} ${demand}\n`
  })

  // Vehicle assignments
  vrpContent += "VEHICLE_SECTION\n"
  vehicles.forEach((vehicle, index) => {
    vrpContent += `${index + 1} ${vehicle.depotId} ${vehicle.capacity} ${vehicle.shiftStart} ${vehicle.shiftEnd}\n`
  })

  vrpContent += "EOF"
  return vrpContent
}

export function generateDynamicParFile(config: LKH3Config): string {
  return `PROBLEM_FILE = ${config.timeSlice}_schedule.vrp
VEHICLES = ${config.vehicles.length}
CAPACITY = ${config.vehicles[0].capacity}
TIME_WINDOW_SECTION
DEPOT_SECTION
MAX_TRIALS = ${config.maxTrials}
RUNS = 20
MOVE_TYPE = 5 SPECIAL
CANDIDATE_SET_TYPE = DELAUNAY
TIME_LIMIT = ${config.timeLimit}
TRACE_LEVEL = 1
POPULATION_SIZE = 10
SEED = ${Date.now() % 1000}`
}

function getTimeWindowForSlice(timeWindows: TimeWindow[], slice: "AM" | "PM"): TimeWindow {
  return (
    timeWindows.find((tw) => tw.period === slice) || {
      start: 0,
      end: 86400, // Fallback to full day
      period: slice,
    }
  )
}

async function writeTempFile(filename: string, content: string): Promise<string> {
  const tempDir = join(process.cwd(), "temp")
  await mkdir(tempDir, { recursive: true })
  const filePath = join(tempDir, filename)
  await writeFile(filePath, content)
  return filePath
}

export async function runLKH3(parFilePath: string): Promise<string> {
  const response = await fetch("/api/run-lkh3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parFilePath }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.text()
  return result
}

async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    await unlink(filePath)
  }
}

export function processLKH3Result(result: string, config: LKH3Config): OptimizedRoute[] {
  // Implement the logic to parse LKH-3 output and convert it to OptimizedRoute[]
  // This is a placeholder implementation and should be replaced with actual parsing logic
  const routes: OptimizedRoute[] = []
  // ... parsing logic here
  return routes
}

export async function optimizeRoutesDynamic(
  depots: Depot[],
  stops: BusStop[],
  vehicles: Vehicle[],
  timeSlice: "AM" | "PM",
): Promise<OptimizedRoute[]> {
  const config: LKH3Config = {
    vehicles: vehicles.filter((v) => v.shift === timeSlice),
    depots,
    stops: stops.filter((s) => hasDemandInSlice(s, timeSlice)),
    timeSlice,
    maxTrials: timeSlice === "AM" ? 1000 : 800,
    timeLimit: 600, // 10 minutes
  }

  const vrpContent = generateDynamicVRPFile(config)
  const parContent = generateDynamicParFile(config)

  const vrpPath = await writeTempFile(`${timeSlice}_schedule.vrp`, vrpContent)
  const parPath = await writeTempFile(`${timeSlice}_params.par`, parContent)

  const result = await runLKH3(parPath)

  const optimizedRoute = processLKH3Result(result, config)
  await cleanupTempFiles([vrpPath, parPath])

  return optimizedRoute
}

function hasDemandInSlice(stop: BusStop, slice: "AM" | "PM"): boolean {
  return (slice === "AM" && stop.amDemand !== 0) || (slice === "PM" && stop.pmDemand !== 0)
}

