export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  priority: number;
  am_peak_demand: number;
  pm_peak_demand: number;
  time_window_start: string;
  time_window_end: string;
}

export interface Depot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  open_time: string;
  close_time: string;
}

export interface Vehicle {
  id: string;
  name: string;
  depot_id: string;
  capacity: number;
  shift_start: string;
  shift_end: string;
}

export interface OptimizedRoute {
  id: string;
  name: string;
  stops: BusStop[];
  path: [number, number][];
  distance: number;
  duration: number;
  buses: number;
  frequency: number;
  created_at: string;
}

export interface HistoricalData {
  id: string;
  bus_stop_id: string;
  timestamp: string;
  passenger_count: number;
  weather_condition: string;
  is_holiday: boolean;
  is_weekend: boolean;
}