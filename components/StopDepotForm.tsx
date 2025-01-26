import type React from "react"
import { useState } from "react"
import type { BusStop, Depot } from "../types/types"

interface StopDepotFormProps {
  onAddBusStop: (stop: BusStop) => void
  onAddDepot: (depot: Depot) => void
}

export default function StopDepotForm({ onAddBusStop, onAddDepot }: StopDepotFormProps) {
  const [formType, setFormType] = useState<"busStop" | "depot">("busStop")
  const [busStop, setBusStop] = useState<Partial<BusStop>>({
    timeWindows: [
      { start: 0, end: 43200, period: "AM" },
      { start: 43200, end: 86400, period: "PM" },
    ],
    amDemand: 0,
    pmDemand: 0,
  })
  const [depot, setDepot] = useState<Partial<Depot>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formType === "busStop" && busStop.name && busStop.latitude && busStop.longitude) {
      onAddBusStop({
        id: "",
        name: busStop.name,
        latitude: busStop.latitude,
        longitude: busStop.longitude,
        priority: busStop.priority || 1,
        am_peak_demand: busStop.amDemand || 0,
        pm_peak_demand: busStop.pmDemand || 0,
        time_window_start: busStop.timeWindows[0].start.toString(),
        time_window_end: busStop.timeWindows[1].end.toString(),
      })
      setBusStop({
        timeWindows: [
          { start: 0, end: 43200, period: "AM" },
          { start: 43200, end: 86400, period: "PM" },
        ],
        amDemand: 0,
        pmDemand: 0,
      })
    } else if (formType === "depot" && depot.name && depot.latitude && depot.longitude) {
      onAddDepot({
        id: "",
        name: depot.name,
        latitude: depot.latitude,
        longitude: depot.longitude,
        open_time: depot.open_time || "00:00",
        close_time: depot.close_time || "23:59",
      })
      setDepot({})
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg">
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            value="busStop"
            checked={formType === "busStop"}
            onChange={() => setFormType("busStop")}
          />
          Bus Stop
        </label>
        <label>
          <input type="radio" value="depot" checked={formType === "depot"} onChange={() => setFormType("depot")} />
          Depot
        </label>
      </div>

      {formType === "busStop" ? (
        <>
          <input
            type="text"
            placeholder="Bus Stop Name"
            value={busStop.name || ""}
            onChange={(e) => setBusStop({ ...busStop, name: e.target.value })}
            className="mb-2 p-2 w-full"
          />
          <input
            type="number"
            placeholder="Latitude"
            value={busStop.latitude || ""}
            onChange={(e) => setBusStop({ ...busStop, latitude: Number.parseFloat(e.target.value) })}
            className="mb-2 p-2 w-full"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={busStop.longitude || ""}
            onChange={(e) => setBusStop({ ...busStop, longitude: Number.parseFloat(e.target.value) })}
            className="mb-2 p-2 w-full"
          />
          <input
            type="number"
            placeholder="AM Demand"
            value={busStop.amDemand || ""}
            onChange={(e) => setBusStop({ ...busStop, amDemand: Number.parseInt(e.target.value) })}
            className="mb-2 p-2 w-full"
          />
          <input
            type="number"
            placeholder="PM Demand"
            value={busStop.pmDemand || ""}
            onChange={(e) => setBusStop({ ...busStop, pmDemand: Number.parseInt(e.target.value) })}
            className="mb-2 p-2 w-full"
          />
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Depot Name"
            value={depot.name || ""}
            onChange={(e) => setDepot({ ...depot, name: e.target.value })}
            className="mb-2 p-2 w-full"
          />
          <input
            type="number"
            placeholder="Latitude"
            value={depot.latitude || ""}
            onChange={(e) => setDepot({ ...depot, latitude: Number.parseFloat(e.target.value) })}
            className="mb-2 p-2 w-full"
          />
          <input
            type="number"
            placeholder="Longitude"
            value={depot.longitude || ""}
            onChange={(e) => setDepot({ ...depot, longitude: Number.parseFloat(e.target.value) })}
            className="mb-2 p-2 w-full"
          />
        </>
      )}

      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add {formType === "busStop" ? "Bus Stop" : "Depot"}
      </button>
    </form>
  )
}

