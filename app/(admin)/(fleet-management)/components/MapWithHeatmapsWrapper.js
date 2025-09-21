'use client'

import dynamic from "next/dynamic"

const MapWithHeatmaps = dynamic(() =>import("./MapWithHeatmaps"), {
    ssr: false
})

export default function MapWithHeatmapsWrapper() {
    return <MapWithHeatmaps />
}