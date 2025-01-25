"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { optimizeRoutes } from "../utils/routeOptimizer"
import { depots, stops, vehicles } from "../utils/dataPreparation"
import RouteDisplay from "../components/RouteDisplay"
import type { OptimizedRoute } from "../types/types"
import { supabase } from "../lib/supabaseClient"

const MapWithNoSSR = dynamic(() => import("../components/Map"), {
  ssr: false,
})

export default function Home() {
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])

  useEffect(() => {
    fetchOptimizedRoutes()
  }, [])

  async function fetchOptimizedRoutes() {
    try {
      const { data, error } = await supabase.from("optimized_routes").select("*")
      if (error) throw error
      setOptimizedRoutes(data || [])
    } catch (err) {
      console.error("Failed to fetch routes:", err)
    }
  }

  async function handleOptimizeRoutes() {
    try {
      const routes = await optimizeRoutes(depots, stops, vehicles)
      setOptimizedRoutes(routes)
    } catch (err) {
      console.error("Optimization failed:", err)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-2xl font-bold p-4">Advanced Bus Route Optimizer</h1>

      <div className="flex-1 flex">
        <div className="w-1/2">
          <MapWithNoSSR optimizedRoutes={optimizedRoutes} />
        </div>

        <div className="w-1/2 overflow-y-auto bg-gray-100">
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
        >
          Optimize Routes
        </button>
      </div>
    </div>
  )
}

