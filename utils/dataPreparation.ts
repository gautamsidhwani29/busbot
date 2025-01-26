import type { Depot, BusStop, Vehicle } from "../types/types"

export function timeToSeconds(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60
}

export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function sliceTimeWindows(stops: BusStop[]): { amPeak: BusStop[]; pmPeak: BusStop[] } {
  const amPeak = stops.filter((stop) => {
    const startSeconds = timeToSeconds(stop.time_window_start)
    return startSeconds < 12 * 3600 // Before 12:00
  })

  const pmPeak = stops.filter((stop) => {
    const endSeconds = timeToSeconds(stop.time_window_end)
    return endSeconds >= 12 * 3600 // After or at 12:00
  })

  return { amPeak, pmPeak }
}

export function updateDepotLocations(depots: Depot[], lastStops: BusStop[]): Depot[] {
  return depots.map((depot, index) => ({
    ...depot,
    latitude: lastStops[index] ? lastStops[index].latitude : depot.latitude,
    longitude: lastStops[index] ? lastStops[index].longitude : depot.longitude,
  }))
}

