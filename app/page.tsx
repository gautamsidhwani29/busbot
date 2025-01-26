"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { optimizeRoutes } from "../utils/routeOptimizer"
import RouteDisplay from "../components/RouteDisplay"
import StopDepotForm from "../components/StopDepotForm"
import type { OptimizedRoute, BusStop, Depot, Vehicle, UpdateBusStop, DeleteBusStop } from "../types/types"
import { supabase } from "../lib/supabaseClient"

const MapWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
})

export default function Home() {
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])
  const [busStops, setBusStops] = useState<BusStop[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([fetchOptimizedRoutes(), fetchBusStops(), fetchDepots(), fetchVehicles()])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  async function fetchOptimizedRoutes() {
    const { data, error } = await supabase.from("optimized_routes").select("*")
    if (error) throw error
    setOptimizedRoutes(data || [])
  }

  async function fetchBusStops() {
    const { data, error } = await supabase.from("bus_stops").select("*")
    if (error) throw error
    setBusStops(data || [])
  }

  async function fetchDepots() {
    const { data, error } = await supabase.from("depots").select("*")
    if (error) throw error
    setDepots(data || [])
  }

  async function fetchVehicles() {
    const { data, error } = await supabase.from("vehicles").select("*")
    if (error) throw error
    setVehicles(data || [])
  }

  async function handleOptimizeRoutes() {
    try {
      setError(null)
      setIsLoading(true)
      const routes = await optimizeRoutes(depots, busStops, vehicles)
      setOptimizedRoutes(routes)
      setIsLoading(false)
    } catch (err) {
      console.error("Optimization failed:", err)
      setError("Failed to optimize routes. Please try again.")
      setIsLoading(false)
    }
  }

  async function handleAddBusStop(stop: BusStop) {
    try {
      const { data, error } = await supabase.from("bus_stops").insert(stop).select()
      if (error) throw error
      setBusStops([...busStops, data[0]])
    } catch (err) {
      console.error("Failed to add bus stop:", err)
      setError("Failed to add bus stop. Please try again.")
    }
  }

  async function handleAddDepot(depot: Depot) {
    try {
      const { data, error } = await supabase.from("depots").insert(depot).select()
      if (error) throw error
      setDepots([...depots, data[0]])
    } catch (err) {
      console.error("Failed to add depot:", err)
      setError("Failed to add depot. Please try again.")
    }
  }

  const handleUpdateBusStop: UpdateBusStop = async (id, updates) => {
    try {
      const { error } = await supabase.from("bus_stops").update(updates).eq("id", id)
      if (error) throw error
      setBusStops(busStops.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop)))
    } catch (err) {
      console.error("Failed to update bus stop:", err)
      setError("Failed to update bus stop. Please try again.")
    }
  }

  const handleDeleteBusStop: DeleteBusStop = async (id) => {
    try {
      const { error } = await supabase.from("bus_stops").delete().eq("id", id)
      if (error) throw error
      setBusStops(busStops.filter((stop) => stop.id !== id))
    } catch (err) {
      console.error("Failed to delete bus stop:", err)
      setError("Failed to delete bus stop. Please try again.")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-2xl font-bold p-4">Advanced Bus Route Optimizer</h1>

      {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      <div className="flex-1 flex">
        <div className="w-2/3">
          <MapWithNoSSR
            optimizedRoutes={optimizedRoutes}
            busStops={busStops}
            depots={depots}
            addBusStop={handleAddBusStop}
            addDepot={handleAddDepot}
            updateBusStop={handleUpdateBusStop}
            deleteBusStop={handleDeleteBusStop}
          />
        </div>

        <div className="w-1/3 overflow-y-auto bg-gray-100 p-4">
          <StopDepotForm onAddBusStop={handleAddBusStop} onAddDepot={handleAddDepot} />
          {optimizedRoutes.length > 0 ? (
            <RouteDisplay routes={optimizedRoutes} />
          ) : (
            <p className="text-center p-4">No routes to display. Optimize routes to view them.</p>
          )}
        </div>
      </div>

      <div className="p-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleOptimizeRoutes}
          disabled={isLoading}
        >
          {isLoading ? "Optimizing..." : "Optimize Routes"}
        </button>
      </div>
    </div>
  )
}

