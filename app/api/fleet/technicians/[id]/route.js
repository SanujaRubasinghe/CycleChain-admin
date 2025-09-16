import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Technician from "@/models/Technician";

export async function PUT(request, {params}) {

}

export async function DELETE(request, {params}) {
    try {
        await dbConnect()

        const {id} = await params
        const technician = await Technician.find({id})

        if (!technician) {
            return NextResponse.json({error: 'Technician not found'}, {status: 404})
        }

        await Technician.findByIdAndDelete(id)

        return NextResponse.json({message: "Technician deleted successfully"})
    } catch (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}