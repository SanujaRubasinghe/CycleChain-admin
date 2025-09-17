import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MaintenanceRule from "@/models/MaintenanceRule";
import Bike from "@/models/Bike";
import MaintenanceRecord from "@/models/MaintenanceRecord";

export async function POST(request) {
    try {
        await dbConnect()

        const bikes = await Bike.find({})
        const rules = await MaintenanceRule.find({is_active: true})

        let generatedCount = 0

        for (const bike of bikes) {
            for (const rule of rules) {
                if (rule.bike_type !== bike.type) continue

                let needsMaintenance = false
                let reason = ''

                if (rule.trigger_type === 'mileage' && rule.mileage_interval) {
                    const lastMaintenanceMileage = bike.mileage_at_last_maintenance || 0
                    const milesSinceMaintenance = bike.mileage - lastMaintenanceMileage

                    if (milesSinceMaintenance >= rule.mileage_interval) {
                        needsMaintenance = true
                        reason = `Mileage interval (${rule.mileage_interval} miles) reached. Current
                        : ${milesSinceMaintenance} miles since last maintenance.`
                    }
                }

                if (rule.trigger_type === 'time' && rule.time_interval_days) {
                    const daysSinceMaintenance = Math.floor((new Date() - bike.lastMaintenance) / (1000 * 60 * 60 * 24))
                    console.log(bike.lastMaintenance)

                    if (daysSinceMaintenance >= rule.time_interval_days) {
                        needsMaintenance = true
                        reason = `Time interval (${rule.time_interval_days} days) reached. Current:
                        ${daysSinceMaintenance} days since last maintenance.`
                    }
                }

                if (needsMaintenance) {
                    const existing = await MaintenanceRecord.findOne({
                        bike_id: bike._id,
                        type: rule.maintenance_type,
                        status: {$in: ['scheduled', 'in_progress']}
                    })

                    if (!existing) {
                        const scheduledDate = new Date()
                        scheduledDate.setDate(scheduledDate.getDate() + 2)

                        const record = new MaintenanceRecord({
                            bike_id: bike._id,
                            bikeId: bike.bikeId,
                            scheduled_at: scheduledDate,
                            type: rule.maintenance_type,
                            priority: rule.priority,
                            issue: `Scheduled maintenance: ${rule.name}. ${reason}`,
                            status: 'scheduled'
                        })

                        await record.save()
                        generatedCount++
                    }
                }
            }
        }

        return NextResponse.json({
            message: `Generated ${generatedCount} maintenace tasks`
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}