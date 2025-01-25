import type { Depot, Stop, Vehicle } from "../types/types"
import { exec } from "child_process"
import fs from "fs/promises"

export async function generateLKH3Input(
  depots: Depot[],
  stops: Stop[],
  vehicles: Vehicle[],
  timeSlice: "am" | "pm",
): Promise<string> {
  const nodes = [...depots, ...stops]
  const content = `NAME : BusRouteOptimization
TYPE : MDCVRPTW
DIMENSION : ${nodes.length}
EDGE_WEIGHT_TYPE : EUC_2D
CAPACITY : 50
DEPOT_SECTION
${depots.map((depot, index) => `${index + 1} ${depot.lat} ${depot.lng}`).join("\n")}
NODE_COORD_SECTION
${nodes.map((node, index) => `${index + 1} ${node.lat} ${node.lng}`).join("\n")}
TIME_WINDOW_SECTION
${stops.map((stop, index) => `${depots.length + index + 1} ${stop.timeWindow[0]} ${stop.timeWindow[1]}`).join("\n")}
DEMAND_SECTION
${stops.map((stop, index) => `${depots.length + index + 1} ${timeSlice === "am" ? stop.amPeakDemand : stop.pmPeakDemand}`).join("\n")}
VEHICLE_SECTION
${vehicles.map((vehicle, index) => `${index + 1} ${vehicle.depotId} ${vehicle.shiftStart} ${vehicle.shiftEnd}`).join("\n")}
EOF`

  await fs.writeFile(`bus_routes_${timeSlice}.vrp`, content)
  return `bus_routes_${timeSlice}.vrp`
}

export async function runLKH3(inputFile: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`./LKH mdvrptw_${inputFile.split("_")[2]}`, (error, stdout, stderr) => {
      if (error) {
        reject(`LKH-3 execution error: ${error.message}`)
        return
      }
      if (stderr) {
        console.error(`LKH-3 stderr: ${stderr}`)
      }
      resolve(stdout)
    })
  })
}

export async function parseLKH3Output(output: string): Promise<any[]> {
  // This function would parse the LKH-3 output and return structured route data
  // The implementation depends on the exact format of LKH-3 output
  // For now, we'll return a placeholder
  return [
    {
      vehicleId: "Bus1",
      route: [1, 101, 103, 1],
      startTime: "07:00",
      endTime: "09:00",
    },
  ]
}

