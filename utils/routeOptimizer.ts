export async function optimizeRoutes(
  depots: Depot[],
  stops: BusStop[],
  vehicles: Vehicle[],
): Promise<OptimizedRoute[]> {
  try {
    const [amResponse, pmResponse] = await Promise.all([
      fetch('/api/optimize', {
        method: 'POST',
        body: JSON.stringify({
          depots,
          stops,
          vehicles,
          timeSlice: "AM"
        })
      }),
      fetch('/api/optimize', {
        method: 'POST',
        body: JSON.stringify({
          depots,
          stops,
          vehicles,
          timeSlice: "PM"
        })
      })
    ]);

    const [amRoutes, pmRoutes] = await Promise.all([
      amResponse.json(),
      pmResponse.json()
    ]);

    return [...amRoutes, ...pmRoutes];
  } catch (error) {
    console.error("Optimization failed:", error);
    throw error;
  }
}