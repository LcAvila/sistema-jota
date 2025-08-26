import { NextResponse } from 'next/server';

// Simula a busca de dados do banco de dados
const getFilterOptions = async () => {
  // Em um cenário real, você buscaria estes dados do seu banco de dados.
  // Ex: const sellers = await prisma.user.findMany({ where: { role: 'VENDEDOR' } });
  const sellers = [
    { id: 1, name: 'Vendedor 1' },
    { id: 2, name: 'Vendedor 2' },
  ];

  const paymentMethods = [
    { id: 1, name: 'PIX' },
    { id: 2, name: 'Cartão de Crédito' },
    { id: 3, name: 'Dinheiro' },
  ];

  const channels = [
    { id: 'app', name: 'Aplicativo' },
    { id: 'manual', name: 'Venda Manual' },
  ];

  return {
    sellers,
    paymentMethods,
    channels,
  };
};

export async function GET() {
  try {
    const options = await getFilterOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error('Failed to fetch filter options:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
