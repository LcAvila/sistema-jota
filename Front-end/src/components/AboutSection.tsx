export default function AboutSection() {
  return (
    <section id="sobre" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sobre a Jota Distribuidora</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Desde 2018, levamos qualidade e frescor até você com o melhor serviço de delivery de bebidas em Mesquita - RJ
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Empresa Estabelecida</h3>
            <p className="text-gray-600">Fundada em 02/05/2018, com mais de 6 anos de experiência no mercado</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Rápido</h3>
            <p className="text-gray-600">Entregamos em até 30 minutos na região de Mesquita e arredores</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bebidas Geladas</h3>
            <p className="text-gray-600">Todas as bebidas são mantidas na temperatura ideal para seu prazer</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Facilidade de Pagamento</h3>
            <p className="text-gray-600">Aceitamos cartões de crédito, débito e PIX para sua comodidade</p>
          </div>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-800 mb-4">Nossa Missão</h3>
            <p className="text-lg text-green-700 max-w-4xl mx-auto">
              &quot;Proporcionar momentos especiais através da entrega rápida e confiável de bebidas geladas e produtos de qualidade, 
              conectando pessoas e celebrações em toda a região de Mesquita - RJ.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
