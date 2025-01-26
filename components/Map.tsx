"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useState, useEffect, useRef, useCallback } from "react"
import type { OptimizedRoute, BusStop, Depot, UpdateBusStop, DeleteBusStop } from "../types/types"
import { v4 as uuidv4 } from "uuid"

import ReactDOMServer from "react-dom/server"
import { Warehouse } from "lucide-react"

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapProps {
  optimizedRoutes: OptimizedRoute[]
  busStops: BusStop[]
  depots: Depot[]
  addBusStop: (stop: BusStop) => void
  addDepot: (depot: Depot) => void
  updateBusStop: UpdateBusStop
  deleteBusStop: DeleteBusStop
}

function AddMarkerOnClick({
  addBusStop,
  addDepot,
}: {
  addBusStop: MapProps["addBusStop"]
  addDepot: MapProps["addDepot"]
}) {
  const [addingMode, setAddingMode] = useState<"busStop" | "depot" | null>(null)

  useMapEvents({
    click(e) {
      if (addingMode === "busStop") {
        const newStop: BusStop = {
          id: uuidv4(),
          name: `Stop ${Date.now()}`,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          priority: 1,
          am_peak_demand: 0,
          pm_peak_demand: 0,
          time_window_start: "00:00",
          time_window_end: "23:59",
        }
        addBusStop(newStop)
        setAddingMode(null)
      } else if (addingMode === "depot") {
        const newDepot: Depot = {
          id: uuidv4(),
          name: `Depot ${Date.now()}`,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          open_time: "00:00",
          close_time: "23:59",
        }
        addDepot(newDepot)
        setAddingMode(null)
      }
    },
  })

  return (
    <div className="leaflet-top leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <button onClick={() => setAddingMode("busStop")} className="p-2 bg-blue-500 text-white">
          Add Bus Stop
        </button>
        <button onClick={() => setAddingMode("depot")} className="p-2 bg-green-500 text-white">
          Add Depot
        </button>
      </div>
    </div>
  )
}

function BusStopPopup({
  stop,
  updateBusStop,
  deleteBusStop,
}: {
  stop: BusStop
  updateBusStop: UpdateBusStop
  deleteBusStop: DeleteBusStop
}) {
  const [name, setName] = useState(stop.name)
  const [priority, setPriority] = useState(stop.priority.toString())

  const handleUpdate = () => {
    updateBusStop(stop.id, { name, priority: Number.parseInt(priority) })
  }

  const handleDelete = () => {
    deleteBusStop(stop.id)
  }

  return (
    <div className="p-2">
      <h3 className="font-bold mb-2">Bus Stop: {stop.name}</h3>
      <div className="mb-2">
        <Label htmlFor="name">Name:</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
      </div>
      <div className="mb-2">
        <Label htmlFor="priority">Priority:</Label>
        <Input
          id="priority"
          type="number"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="mb-2">
        <p>AM Demand: {stop.am_peak_demand}</p>
        <p>PM Demand: {stop.pm_peak_demand}</p>
      </div>
      <div className="flex justify-between">
        <Button onClick={handleUpdate} className="bg-blue-500 text-white">
          Update
        </Button>
        <Button onClick={handleDelete} className="bg-red-500 text-white">
          Delete
        </Button>
      </div>
    </div>
  )
}

function MapContent({
  optimizedRoutes,
  busStops,
  depots,
  addBusStop,
  addDepot,
  updateBusStop,
  deleteBusStop,
}: MapProps) {
  const map = useMap()
  const routeColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33F1",
    "#33FFF1",
    "#FFF133",
    "#FF3333",
    "#33FF33",
    "#3333FF",
    "#FF33FF",
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [map])

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {optimizedRoutes?.map((route, index) => {
        if (route.path && route.id) {
          return (
            <Polyline
              key={route.id}
              positions={route.path}
              color={routeColors[index % routeColors.length]}
              weight={3}
              opacity={0.7}
            >
              <Popup>
                Route {index + 1}
                <br />
                Buses: {route.buses}
                <br />
                Frequency: Every {Math.round(60 / route.frequency)} minutes
              </Popup>
            </Polyline>
          )
        }
        return null
      })}
      {busStops?.map((stop) => (
        <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
          <Popup>
            <BusStopPopup stop={stop} updateBusStop={updateBusStop} deleteBusStop={deleteBusStop} />
          </Popup>
        </Marker>
      ))}
      {depots?.map((depot) => (
        <Marker
          key={depot.id}
          position={[depot.latitude, depot.longitude]}
          icon={L.divIcon({
            className: "custom-icon",
            html: ReactDOMServer.renderToString(<Warehouse size={24} color="#4CAF50" />),
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>
            Depot: {depot.name}
            <br />
            Open: {depot.open_time}
            <br />
            Close: {depot.close_time}
          </Popup>
        </Marker>
      ))}
      <AddMarkerOnClick addBusStop={addBusStop} addDepot={addDepot} />
    </>
  )
}

function MapWrapper(props: MapProps) {
  const [key, setKey] = useState(0)
  const mapInstanceRef = useRef<L.Map | null>(null)

  const handleMapCreate = useCallback((map: L.Map) => {
    mapInstanceRef.current = map
  }, [])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Force remount if there's an error
  useEffect(() => {
    const handleError = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setKey((prev) => prev + 1)
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        key={`map-${key}`}
        center={[45.5, -73.6]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        whenCreated={handleMapCreate}
      >
        <MapContent {...props} />
      </MapContainer>
    </div>
  )
}

export default function Map(props: MapProps) {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapWrapper {...props} />
    </div>
  )
}

