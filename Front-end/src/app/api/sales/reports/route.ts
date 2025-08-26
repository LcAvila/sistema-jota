import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${API_BASE_URL}/api/sales/reports?${queryString}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar relatórios de vendas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar relatórios de vendas' },
      { status: 500 }
    );
  }
}
