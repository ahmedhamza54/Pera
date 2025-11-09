import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import connectDB from '@/lib/db/connect';
import { Diagnostic } from '@/lib/models/Diagnostic';

// GET /api/diagnostic - Get diagnostic for current user
export async function GET() {
    try {
        await connectDB();
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const diagnostic = await Diagnostic.findOne({ userId: session.user.id });
        return NextResponse.json(diagnostic || null);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/diagnostic - Create or update diagnostic
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { objectif, problem, motivation, tasks } = data;

        // Update or create diagnostic
        const diagnostic = await Diagnostic.findOneAndUpdate(
            { userId: session.user.id,},
            {
                userId: session.user.id,
                objectif,
                problem,
                motivation,
                tasks,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(diagnostic);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/diagnostic - Update diagnostic status
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        
        const diagnostic = await Diagnostic.findOneAndUpdate(
            {userId: session.user.id },
            { $set: data },
            { new: true }
        );

        if (!diagnostic) {
            return NextResponse.json({ error: 'Diagnostic not found' }, { status: 404 });
        }

        return NextResponse.json(diagnostic);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}