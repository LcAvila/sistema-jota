"use client";
import { useState } from "react";

export default function ContactSection() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");

  const formatPhoneBR = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "").slice(0, 11);
    // (99) 99999-9999 ou (99) 9999-9999
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleEnviarWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = `Olá! Meu nome é ${nome || ""}. Telefone: ${telefone || ""}.\n${mensagem || ""}`.trim();
    const url = `https://wa.me/5521970255214?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };
  return (
    <section id="contato" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Entre em Contato</h2>
          <p className="text-lg text-gray-600">
            Estamos sempre prontos para atender você! Faça seu pedido pelos nossos canais de atendimento
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Informações de Contato */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informações da Empresa</h3>
              
              <div className="space-y-4">
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Endereço</h4>
                    <p className="text-gray-600">Travessa Marco Schinaider, 40, Casa 2</p>
                    <p className="text-gray-600">Jacutinga, Mesquita – RJ</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Telefones</h4>
                    <p className="text-gray-600">(21) 9801-4824</p>
                    <p className="text-gray-600">(21) 99801-4824</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">E-mail</h4>
                    <p className="text-gray-600">jotacomerciorio@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">CNPJ</h4>
                    <p className="text-gray-600">30.344.417/0001-32</p>
                    <p className="text-gray-600 text-sm">J.S. Henrique Comércio e Distribuição de Alimentos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ações, Formulário e Mapa */}
          <div className="space-y-6">
            {/* CTA */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">Faça seu Pedido Agora!</h3>
              <p className="text-green-100 mb-6">Fale com a gente pelo WhatsApp e receba rápido em casa</p>
              <a
                href="https://wa.me/5521970255214"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                <span className="text-2xl">📱</span>
                Chamar no WhatsApp
              </a>
            </div>

            {/* Formulário rápido */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pedido rápido pelo WhatsApp</h3>
              <form onSubmit={handleEnviarWhatsapp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Seu nome</label>
                  <input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: João Silva" className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                  <input 
                    value={telefone} 
                    onChange={(e) => setTelefone(formatPhoneBR(e.target.value))} 
                    required 
                    placeholder="(21) 99999-9999" 
                    inputMode="tel"
                    maxLength={16}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" 
                    aria-label="Telefone para contato"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 mb-1">Mensagem</label>
                  <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={4} placeholder="Ex: Gostaria de 2 caixas de Heineken 350ml e 1 saco de gelo." className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"></textarea>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md">Enviar no WhatsApp</button>
                </div>
              </form>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-2xl p-2 shadow-lg overflow-hidden">
              <iframe
                title="Localização - Jota Distribuidora"
                src="https://www.google.com/maps?q=Travessa%20Marco%20Schinaider%2C%2040%2C%20Jacutinga%2C%20Mesquita%20-%20RJ&output=embed"
                width="100%"
                height="260"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Horário */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Horário de Funcionamento</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Segunda a Sexta</span>
                  <span className="font-semibold text-gray-900">08:00 - 22:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sábado</span>
                  <span className="font-semibold text-gray-900">08:00 - 23:00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Domingo</span>
                  <span className="font-semibold text-gray-900">10:00 - 22:00</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-semibold">Aberto agora - Delivery disponível!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
