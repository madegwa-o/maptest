"use client"

import { useTrackingStore } from "@/stores/trackStore"
import { useEffect, useState } from "react"
import { Activity, Clock, Gauge } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Metrics() {
    const { distance, duration, isTracking, currentPosition, coordinates, clearRoute } = useTrackingStore()

    const [elapsedTime, setElapsedTime] = useState(0)

    useEffect(() => {
        if (isTracking) {
            const interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1)
            }, 1000)
            return () => clearInterval(interval)
        } else {
            setElapsedTime(duration)
        }
    }, [isTracking, duration])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        }
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const avgPace = distance > 0 && elapsedTime > 0 ? (elapsedTime / 60 / distance).toFixed(2) : "0.00"

    const avgSpeed = distance > 0 && elapsedTime > 0 ? (distance / (elapsedTime / 3600)).toFixed(2) : "0.00"

    return (
        <div className="flex h-full flex-col p-6">
            <h2 className="mb-6 text-xl font-bold text-foreground">Activity Metrics</h2>

            <div className="flex flex-1 flex-col gap-6">
                {/* Distance */}
                <div className="rounded-lg border border-border bg-background p-6">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span className="text-sm font-medium">Distance</span>
                    </div>
                    <div className="text-4xl font-bold text-foreground">
                        {distance.toFixed(2)}
                        <span className="ml-2 text-2xl text-muted-foreground">km</span>
                    </div>
                </div>

                {/* Time */}
                <div className="rounded-lg border border-border bg-background p-6">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Time</span>
                    </div>
                    <div className="font-mono text-4xl font-bold text-foreground">{formatTime(elapsedTime)}</div>
                </div>

                {/* Speed */}
                <div className="rounded-lg border border-border bg-background p-6">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <Gauge className="h-4 w-4" />
                        <span className="text-sm font-medium">Average Speed</span>
                    </div>
                    <div className="text-4xl font-bold text-foreground">
                        {avgSpeed}
                        <span className="ml-2 text-2xl text-muted-foreground">km/h</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{avgPace} min/km pace</div>
                </div>

                {/* Status */}
                <div className="mt-auto">
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">GPS Points</span>
                            <span className="font-medium text-foreground">{coordinates.length}</span>
                        </div>
                        {currentPosition && (
                            <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Position</span>
                                <span className="font-mono text-xs text-foreground">
                  {currentPosition[1].toFixed(4)}, {currentPosition[0].toFixed(4)}
                </span>
                            </div>
                        )}
                    </div>

                    {!isTracking && coordinates.length > 0 && (
                        <Button onClick={clearRoute} variant="outline" className="mt-4 w-full bg-transparent">
                            Clear Route
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
