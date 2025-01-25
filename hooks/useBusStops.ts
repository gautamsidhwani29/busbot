import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

interface BusStop {
  id: string
  name: string
  priority: number
  position: [number, number]
}

export function useBusStops() {
  const [busStops, setBusStops] = useState<BusStop[]>([])

  useEffect(() => {
    fetchBusStops()
  }, [])

  async function fetchBusStops() {
    try {
      const { data, error } = await supabase.from("bus_stops").select("*")
      if (error) {
        if (error.code === "42P01") {
          console.error("The bus_stops table does not exist. Please create it in your Supabase database.")
        } else {
          console.error("Error fetching bus stops:", error)
        }
      } else {
        setBusStops(data || [])
      }
    } catch (err) {
      console.error("Failed to fetch bus stops:", err)
    }
  }

  async function addBusStop(stop: BusStop) {
    try {
      const { data, error } = await supabase.from("bus_stops").insert([stop]).select()
      if (error) {
        if (error.code === "42P01") {
          console.error("The bus_stops table does not exist. Please create it in your Supabase database.")
        } else {
          console.error("Error adding bus stop:", error)
        }
      } else {
        setBusStops([...busStops, ...(data || [])])
      }
    } catch (err) {
      console.error("Failed to add bus stop:", err)
    }
  }

  async function updateBusStop(id: string, updates: Partial<BusStop>) {
    try {
      const { data, error } = await supabase.from("bus_stops").update(updates).eq("id", id).select()
      if (error) {
        console.error("Error updating bus stop:", error)
      } else {
        setBusStops(busStops.map((stop) => (stop.id === id ? { ...stop, ...updates } : stop)))
      }
    } catch (err) {
      console.error("Failed to update bus stop:", err)
    }
  }

  async function deleteBusStop(id: string) {
    try {
      const { error } = await supabase.from("bus_stops").delete().eq("id", id)
      if (error) {
        console.error("Error deleting bus stop:", error)
      } else {
        setBusStops(busStops.filter((stop) => stop.id !== id))
      }
    } catch (err) {
      console.error("Failed to delete bus stop:", err)
    }
  }

  return { busStops, addBusStop, updateBusStop, deleteBusStop }
}

