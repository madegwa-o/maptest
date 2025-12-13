"use client"

import { useEffect, useRef, useState } from "react"
import { useTrackingStore } from "@/stores/trackStore"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { getMapboxToken } from "@/lib/actions"

export function Map() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const marker = useRef<mapboxgl.Marker | null>(null)

    const { coordinates, currentPosition, isTracking } = useTrackingStore()
    const [mapLoaded, setMapLoaded] = useState(false)
    const [tokenLoaded, setTokenLoaded] = useState(false)

    useEffect(() => {
        getMapboxToken().then((token) => {
            mapboxgl.accessToken = token
            ;(mapboxgl as any).workerClass = null
            setTokenLoaded(true)
        })
    }, [])

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current || !tokenLoaded) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [-74.5, 40],
            zoom: 13,
            pitch: 0,
        })

        map.current.on("load", () => {
            setMapLoaded(true)

            // Add route line source and layer
            map.current?.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: [],
                    },
                },
            })

            map.current?.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#FF6B2C",
                    "line-width": 5,
                    "line-opacity": 0.9,
                },
            })

            console.log("[v0] Map loaded and route layer added")
        })

        return () => {
            marker.current?.remove()
            map.current?.remove()
        }
    }, [tokenLoaded])

    // Update user marker and center map on current position
    useEffect(() => {
        if (!map.current || !mapLoaded || !currentPosition) return

        const [lng, lat] = currentPosition

        console.log("[v0] Updating marker position:", { lng, lat })

        // Create or update marker
        if (!marker.current) {
            const el = document.createElement("div")
            el.className = "w-4 h-4 bg-track-active rounded-full border-4 border-white shadow-lg"

            marker.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map.current)
            console.log("[v0] Marker created")
        } else {
            marker.current.setLngLat([lng, lat])
            console.log("[v0] Marker updated")
        }

        // Pan to current position if tracking
        if (isTracking) {
            map.current.easeTo({
                center: [lng, lat],
                duration: 1000,
            })
        }
    }, [currentPosition, mapLoaded, isTracking])

    // Update route polyline
    useEffect(() => {
        if (!map.current || !mapLoaded) return

        const source = map.current.getSource("route") as mapboxgl.GeoJSONSource

        if (source && coordinates.length > 0) {
            source.setData({
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: coordinates,
                },
            })
            console.log("[v0] Route updated with", coordinates.length, "points")
        }
    }, [coordinates, mapLoaded])

    return (
        <div className="relative h-full w-full">
            <div ref={mapContainer} className="h-full w-full" />

            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="text-muted-foreground">Loading map...</div>
                </div>
            )}
        </div>
    )
}
