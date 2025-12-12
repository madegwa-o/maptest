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

    // Load Mapbox token
    useEffect(() => {
        getMapboxToken().then((token) => {
            mapboxgl.accessToken = token
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

            // Add empty route source
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

            // Add line layer
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
        })

        // Cleanup
        return () => {
            marker.current?.remove()
            map.current?.remove()
        }
    }, [tokenLoaded])

    // Update marker position
    useEffect(() => {
        if (!map.current || !mapLoaded || !currentPosition) return

        const [lng, lat] = currentPosition

        if (!marker.current) {
            const el = document.createElement("div")
            el.className = "w-4 h-4 bg-track-active rounded-full border-4 border-white shadow-lg"

            marker.current = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map.current)
        } else {
            marker.current.setLngLat([lng, lat])
        }

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
                    coordinates,
                },
            })
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
