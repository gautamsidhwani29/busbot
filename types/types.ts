export interface BusStop {
  id: string
  name: string
  latitude: number
  longitude: number
  priority: number
  amDemand: number
  pmDemand: number
  timeWindows: TimeWindow[]
}

export type UpdateBusStop = (id: string, updates: Partial<BusStop>) => Promise<void>

export type DeleteBusStop = (id: string) => Promise<void>

export interface Depot {
  id: string
  name: string
  latitude: number
  longitude: number
  open_time: string
  close_time: string
}

export interface Vehicle {
  id: string
  name: string
  depotId: string
  capacity: number
  shiftStart: number
  shiftEnd: number
  shift: "AM" | "PM"
}

export interface OptimizedRoute {
  id: string
  name: string
  stops: BusStop[]
  path: [number, number][]
  distance: number
  duration: number
  buses: number
  frequency: number
  created_at: string
}

export interface HistoricalData {
  id: string
  bus_stop_id: string
  timestamp: string
  passenger_count: number
  weather_condition: string
  is_holiday: boolean
  is_weekend: boolean
}

export interface TimeWindow {
  start: number
  end: number
  period: "AM" | "PM"
}

