import { supabase } from './supabaseClient';
import { BusStop, Depot, Vehicle, OptimizedRoute, HistoricalData } from '../types/types';

export async function getBusStops(): Promise<BusStop[]> {
  const { data, error } = await supabase.from('bus_stops').select('*');
  if (error) throw error;
  return data;
}

export async function getDepots(): Promise<Depot[]> {
  const { data, error } = await supabase.from('depots').select('*');
  if (error) throw error;
  return data;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase.from('vehicles').select('*');
  if (error) throw error;
  return data;
}

export async function getOptimizedRoutes(): Promise<OptimizedRoute[]> {
  const { data, error } = await supabase.from('optimized_routes').select('*');
  if (error) throw error;
  return data;
}

export async function insertOptimizedRoute(route: Omit<OptimizedRoute, 'id' | 'created_at'>): Promise<OptimizedRoute> {
  const { data, error } = await supabase.from('optimized_routes').insert(route).select().single();
  if (error) throw error;
  return data;
}

export async function getHistoricalData(busStopId: string, startDate: Date, endDate: Date): Promise<HistoricalData[]> {
  const { data, error } = await supabase
    .from('historical_data')
    .select('*')
    .eq('bus_stop_id', busStopId)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString());
  if (error) throw error;
  return data;
}