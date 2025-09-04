import dbConnect from '@/lib/mongodb';
import Bike from '@/models/Bike';
import { getMqttClient } from "@/lib/mqttClient";
import React from 'react';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  await dbConnect()
  const {id} = await params
  try {
    const bike = await Bike.findOne({ bikeId: id });
    if (!bike) {
      return new Response(JSON.stringify({ error: 'Bike not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(bike), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  const client = getMqttClient()
  const {id} = await params
  try {
    const { status, isLocked, lat, lng, name } = await request.json();
    const update = {};
    if (status) update.status = status;
    if (isLocked !== undefined) update.isLocked = isLocked;
    if (lat && lng) update.currentLocation = { lat, lng };

    const bike = await Bike.findOneAndUpdate(
      { bikeId: id },
      update,
      { new: true }
    );

    const topic = `bike/B001/command`
    const message = isLocked ? "lock" : "unlock"

    client.publish(topic, message, {qos: 1}, (err) => {
      if (err) {
          return new Response(JSON.stringify({success: false, error: err.message}), {status: 500})
      }
      console.log("MQTT command sent:",topic,message)
    })
    return new Response(JSON.stringify(bike), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(request , {params}) {
  const {id} = await params
  const {adminPassword} = await request.json()

  console.log(id)

  try {
    await dbConnect()

    if (!adminPassword) {
      return NextResponse.json({message: "Admin password required"}, {status: 400})
    }

    if(adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({message: "Invalid admin password"}, {status: 401})
    }

    const bike = Bike.findOne({bikeId: id})
    if (!bike) {
      return NextResponse.json({message: "Bike not found"}, {status: 404})
    }

    await Bike.findOneAndDelete(id)

    return NextResponse.json({message: "Bike deleted successfully"}, {status: 200})
  } catch (error) {
    console.log(error)
    return NextResponse.json({message: "Internal server error"}, {status: 500})
  }
}