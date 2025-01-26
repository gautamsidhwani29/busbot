import type { Depot, BusStop, Vehicle, OptimizedRoute } from "../types/types"
import { optimizeRoutesDynamic } from "./lkh3"
import { supabase } from "../lib/supabaseClient"

export async function optimizeRoutes(
  depots: Depot[],
  stops: BusStop[],
  vehicles: Vehicle[],
): Promise<OptimizedRoute[]> {
  const optimizedRoutes: OptimizedRoute[] = []

  // Optimize AM routes
  const amRoutes = await optimizeRoutesDynamic(depots, stops, vehicles, "AM")
  optimizedRoutes.push(...amRoutes)

  // Optimize PM routes
  const pmRoutes = await optimizeRoutesDynamic(depots, stops, vehicles, "PM")
  optimizedRoutes.push(...pmRoutes)

  // Save optimized routes to the database
  for (const route of optimizedRoutes) {
    const { data, error } = await supabase.from("optimized_routes").insert(route).select()
    if (error) throw error
  }

  return optimizedRoutes
}

