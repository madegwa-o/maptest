import { create } from "zustand"
import { calculateDistance } from "@/lib/geo"

interface TrackingState {
    isTracking: boolean
    coordinates: [number, number][]
    currentPosition: [number, number] | null
    distance: number
    duration: number
    startTime: number | null
    watchId: number | null

    startTracking: () => void
    stopTracking: () => void
    addCoordinate: (coord: [number, number]) => void
    clearRoute: () => void
    loadSavedRoute: () => void
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
    isTracking: false,
    coordinates: [],
    currentPosition: null,
    distance: 0,
    duration: 0,
    startTime: null,
    watchId: null,

    startTracking: () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser")
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const coord: [number, number] = [position.coords.longitude, position.coords.latitude]

                const state = get()

                // Calculate distance if we have a previous point
                let newDistance = state.distance
                if (state.coordinates.length > 0) {
                    const lastCoord = state.coordinates[state.coordinates.length - 1]
                    newDistance += calculateDistance(lastCoord[1], lastCoord[0], coord[1], coord[0])
                }

                set({
                    coordinates: [...state.coordinates, coord],
                    currentPosition: coord,
                    distance: newDistance,
                })
            },
            (error) => {
                console.error("Geolocation error:", error)
                alert("Unable to get your location. Please check your browser permissions.")
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            },
        )

        set({
            isTracking: true,
            watchId,
            startTime: Date.now(),
            coordinates: [],
            distance: 0,
            duration: 0,
        })
    },

    stopTracking: () => {
        const state = get()

        if (state.watchId !== null) {
            navigator.geolocation.clearWatch(state.watchId)
        }

        const endTime = Date.now()
        const duration = state.startTime ? Math.floor((endTime - state.startTime) / 1000) : 0

        set({
            isTracking: false,
            watchId: null,
            duration,
        })

        // Save route to localStorage
        const routeData = {
            coordinates: state.coordinates,
            distance: state.distance,
            duration,
            timestamp: endTime,
        }

        localStorage.setItem("lastRoute", JSON.stringify(routeData))

        // Also save to history
        const history = JSON.parse(localStorage.getItem("routeHistory") || "[]")
        history.unshift(routeData)
        localStorage.setItem("routeHistory", JSON.stringify(history.slice(0, 10)))
    },

    addCoordinate: (coord) => {
        set((state) => ({
            coordinates: [...state.coordinates, coord],
            currentPosition: coord,
        }))
    },

    clearRoute: () => {
        set({
            coordinates: [],
            currentPosition: null,
            distance: 0,
            duration: 0,
            startTime: null,
        })
    },

    loadSavedRoute: () => {
        const saved = localStorage.getItem("lastRoute")
        if (saved) {
            const data = JSON.parse(saved)
            set({
                coordinates: data.coordinates,
                distance: data.distance,
                duration: data.duration,
                currentPosition: data.coordinates[data.coordinates.length - 1] || null,
            })
        }
    },
}))
