'use client'

import dynamic from "next/dynamic"

const EmergencyAlertModal = dynamic(() => import("./EmergencyAlert"), {
    ssr: false
})

export default function EmergencyAlertModalWrapper() {
    return <EmergencyAlertModal />
}