import type { Depot, Stop, Vehicle } from "../types/types"

export const depots: Depot[] = [
  { id: 1, lat: 45.523, lng: -73.556, openTime: "06:00", closeTime: "22:00" },
  { id: 2, lat: 45.531, lng: -73.562, openTime: "05:30", closeTime: "23:00" },
]

export const stops: Stop[] = [
  { id: 101, amPeakDemand: 50, pmPeakDemand: 20, lat: 45.520, lng: -73.55, timeWindow: [25200, 32400], position: [45.520, -73.55] },
  { id: 102, amPeakDemand: -30, pmPeakDemand: -10, lat: 45.525, lng: -73.56, timeWindow: [57600, 64800], position: [45.525, -73.56] }
];
export const vehicles: Vehicle[] = [
  { id: "Bus1", depotId: 1, capacity: 50, shiftStart: "06:00", shiftEnd: "10:00" },
  { id: "Bus2", depotId: 2, capacity: 50, shiftStart: "15:00", shiftEnd: "19:00" },
]

export function timeToSeconds(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60
}

export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export function sliceTimeWindows(stops: Stop[]): { amPeak: Stop[]; pmPeak: Stop[] } {
  const amPeak = stops.filter((stop) => stop.timeWindow[0] < 12 * 3600)
  const pmPeak = stops.filter((stop) => stop.timeWindow[1] >= 12 * 3600)
  return { amPeak, pmPeak }
}

export function updateDepotLocations(depots: Depot[], lastStops: Stop[]): Depot[] {
  return depots.map((depot, index) => ({
    ...depot,
    lat: lastStops[index] ? lastStops[index].lat : depot.lat,
    lng: lastStops[index] ? lastStops[index].lng : depot.lng,
  }))
}

