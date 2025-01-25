export async function fetchRoadRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
  )
  const data = await response.json()

  if (data.code !== "Ok") {
    throw new Error("Failed to fetch route")
  }

  return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
}

