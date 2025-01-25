import { Depot, Stop, Vehicle, OptimizedRoute } from '../types/types';
import { sliceTimeWindows, updateDepotLocations } from './dataPreparation';
import { supabase } from '../lib/supabaseClient';

function calculateDistance(a: [number, number], b: [number, number]): number {
  const [x1, y1] = a;
  const [x2, y2] = b;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function findNearestStop(currentStop: Stop, remainingStops: Stop[]): Stop {
  return remainingStops.reduce((nearest, stop) => 
    calculateDistance(currentStop.position, stop.position) < calculateDistance(currentStop.position, nearest.position) 
      ? stop 
      : nearest
  );
}

function simplifiedRouteOptimization(stops: Stop[], depot: Depot): Stop[] {
  let route: Stop[] = [];
  let remainingStops = [...stops];
  let currentStop = { position: [depot.lat, depot.lng] } as Stop;

  while (remainingStops.length > 0) {
    const nextStop = findNearestStop(currentStop, remainingStops);
    route.push(nextStop);
    remainingStops = remainingStops.filter(stop => stop.id !== nextStop.id);
    currentStop = nextStop;
  }

  return route;
}

export async function optimizeRoutes(
  depots: Depot[],
  stops: Stop[],
  vehicles: Vehicle[]
): Promise<OptimizedRoute[]> {
  const { amPeak, pmPeak } = sliceTimeWindows(stops);
  
  const optimizedRoutes: OptimizedRoute[] = [];

  for (const depot of depots) {
    const amRoute = simplifiedRouteOptimization(amPeak, depot);
    const pmRoute = simplifiedRouteOptimization(pmPeak, depot);

    const createOptimizedRoute = async (route: Stop[], timeSlice: string) => {
      const optimizedRoute: OptimizedRoute = {
        id: '', // Will be set by the database
        stops: route,
        path: route.map(stop => [stop.lat, stop.lng]),
        distance: route.reduce((total, stop, index, array) => 
          index === 0 ? 0 : total + calculateDistance(array[index - 1].position, stop.position), 0),
        duration: route.length * 10, // Simplified: assume 10 minutes per stop
        buses: 1,
        frequency: 60 / (route.length / 2), // Simplified: assume each bus can complete half the route in an hour
      };
      
      const { data, error } = await supabase
        .from('optimized_routes')
        .insert(optimizedRoute)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    };

    optimizedRoutes.push(await createOptimizedRoute(amRoute, 'AM'));
    optimizedRoutes.push(await createOptimizedRoute(pmRoute, 'PM'));
  }
  
  return optimizedRoutes;
}