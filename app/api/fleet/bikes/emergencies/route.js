import { NextResponse } from "next/server";

export async function GET() {
  if (!global.emergencyAlerts) global.emergencyAlerts = {};
  return NextResponse.json({
    success: true,
    emergencies: Object.values(global.emergencyAlerts).filter(
        (e) => !e.dismissed
    ),
  });
}

export async function PUT(request, {params}) {
    try {
        const {id} = await request.json()
        if (global.emergencyAlerts[id]) {
            global.emergencyAlerts[id].dismissed = true
        }
        return new Response({status: 200})
    } catch (err) {
        console.error(err)
        return new Response({status: 500})
    }
}
