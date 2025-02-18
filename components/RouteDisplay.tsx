interface BusStop {
  id: string
  name: string
  priority: number
  position: [number, number]
}

interface Route {
  id: string;  // Will be auto-generated by Postgres
  stops: BusStop[];
  buses: number;
  frequency: number;
}

interface RouteDisplayProps {
  routes: Route[]
}

export default function RouteDisplay({ routes }: RouteDisplayProps) {
  const sharedStops = routes.reduce(
    (acc, route) => {
      route.stops.forEach((stop) => {
        acc[stop.id] = (acc[stop.id] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="p-4 bg-gray-100">
      <h2 className="text-xl font-bold mb-4">Optimized Routes</h2>
      {routes.map((route, index) => (
        <div key={route.id} className="mb-4 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Route {index + 1}</h3>
          <p className="mb-2">Buses: {route.buses}</p>
          <p className="mb-2">Frequency: Every {Math.round(60 / route.frequency)} minutes</p>
          <ul className="list-disc pl-5">
            {route.stops.map((stop) => (
              <li key={stop.id} className={sharedStops[stop.id] > 1 ? "font-bold" : ""}>
                {stop.name} (Priority: {stop.priority}){sharedStops[stop.id] > 1 && " - Shared Stop"}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

