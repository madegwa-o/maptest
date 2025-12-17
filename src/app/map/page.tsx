"use client"

import { useState, useEffect } from "react"
import { Map } from "@/components/map"
import { Metrics } from "@/components/metrics"
import { useTrackingStore } from "@/stores/trackStore"
import { Button } from "@/components/ui/button"
import { Play, Square } from "lucide-react"

export default function Home() {
    const [isClient, setIsClient] = useState(false)
    const { isTracking, startTracking, stopTracking, coordinates } = useTrackingStore()

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleStartStop = () => {
        if (isTracking) {
            stopTracking()
        } else {
            startTracking()
        }
    }

    if (!isClient) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
                <h1 className="text-2xl font-bold text-foreground">RouteTracker</h1>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isTracking ? "bg-track-active animate-pulse" : "bg-muted"}`} />
                    <span className="text-sm text-muted-foreground">{isTracking ? "Tracking" : "Idle"}</span>
                </div>
            </header>

            <div className="relative flex flex-1 flex-col lg:flex-row">
                {/* Map Container */}
                <div className="relative h-[60vh] w-full lg:h-full lg:flex-1">
                    <Map />

                    {/* Floating Control Button */}
                    <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
                        <Button
                            onClick={handleStartStop}
                            size="lg"
                            className={`h-16 w-16 rounded-full shadow-xl transition-all hover:scale-105 ${
                                isTracking ? "bg-destructive hover:bg-destructive/90" : "bg-track-active hover:bg-track-active/90"
                            }`}
                        >
                            {isTracking ? <Square className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                        </Button>
                    </div>
                </div>

                {/* Metrics Panel */}
                <div className="h-[40vh] w-full border-t border-border bg-card lg:h-full lg:w-96 lg:border-l lg:border-t-0">
                    <Metrics />
                </div>
            </div>
        </div>
    )
}
