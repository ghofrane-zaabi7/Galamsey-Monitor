import { NextRequest, NextResponse } from 'next/server';
import { getAllMiningSites, createMiningSite } from '@/lib/db';
import type { MiningSiteInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    let sites = getAllMiningSites();

    if (region) {
      sites = sites.filter(s => s.region === region);
    }
    if (status) {
      sites = sites.filter(s => s.status === status);
    }

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching mining sites:', error);
    return NextResponse.json({ error: 'Failed to fetch mining sites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MiningSiteInput = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'latitude', 'longitude', 'region', 'district', 'status'];
    for (const field of requiredFields) {
      if (!body[field as keyof MiningSiteInput]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const site = createMiningSite(body);
    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error('Error creating mining site:', error);
    return NextResponse.json({ error: 'Failed to create mining site' }, { status: 500 });
  }
}
