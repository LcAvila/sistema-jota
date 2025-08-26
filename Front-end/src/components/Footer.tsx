import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo" aria-label="Rodapé">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white p-2 rounded-lg">
                <Image
  src="/assets/logo/logo.png"
  width={100}
  height={50}
  alt="Logo Jota Distribuidora"
  style={{ width: 'auto', height: 'auto' }}
  className="object-contain"
  aria-label="Logo da Jota Distribuidora"
  role="img"
/>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Jota Distribuidora</h3>
                <p className="text-gray-400 text-sm">Desde 2018 levando qualidade até você</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Especializada em delivery de bebidas geladas, oferecemos o melhor atendimento 
              e os melhores preços da região de Mesquita - RJ. Entregamos onde você estiver!
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Aberto agora</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Delivery em 30min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cartão e PIX</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <a href="#produtos" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2" aria-label="Ir para Produtos" role="link">
                  <span>🍺</span> Nossos Produtos
                </a>
              </li>
              <li>
                <a href="#combos" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2" aria-label="Ir para Combos Promocionais" role="link">
                  <span>🎉</span> Combos Promocionais
                </a>
              </li>
              <li>
                <a href="#sobre" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2" aria-label="Ir para Sobre Nós" role="link">
                  <span>🏢</span> Sobre Nós
                </a>
              </li>
              <li>
                <a href="#contato" className="text-gray-300 hover:text-green-400 transition-colors flex items-center gap-2" aria-label="Ir para Contato" role="link">
                  <span>📞</span> Contato
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">Travessa Marco Schinaider, 40</p>
                  <p className="text-gray-300 text-sm">Jacutinga, Mesquita - RJ</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">(21) 99801-4824</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">jotacomerciorio@gmail.com</p>
                </div>
              </div>
              
              <a 
                href="https://wa.me/5521970255214" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold mt-4"
                aria-label="Fale conosco no WhatsApp"
                role="button"
                tabIndex={0}
              >
                <span>📱</span>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
              <p> 2024 Jota Distribuidora. Todos os direitos reservados.</p>
              <div className="flex items-center gap-2">
                <span>CNPJ:</span>
                <span className="font-mono">30.344.417/0001-32</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Empresa Licenciada</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Compra Segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/5521970255214" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 animate-bounce"
        title="Fale conosco no WhatsApp"
        aria-label="Fale conosco no WhatsApp (flutuante)"
        role="button"
        tabIndex={0}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </a>
    </footer>
  );
}
