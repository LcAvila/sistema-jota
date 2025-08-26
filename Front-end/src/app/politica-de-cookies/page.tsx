export default function PoliticaCookiesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black mb-4" style={{ color: '#000' }}>Política de Cookies</h1>
      <p className="text-[#00754A] mb-6">
        Esta política explica o que são cookies, como os utilizamos e como você pode gerenciá-los.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold" style={{ color: '#000' }}>1. O que são cookies?</h2>
        <p className="text-[#00754A]">Cookies são pequenos arquivos armazenados no seu dispositivo para lembrar preferências e melhorar sua experiência.</p>

        <h2 className="text-xl font-extrabold" style={{ color: '#000' }}>2. Como usamos</h2>
        <p className="text-[#00754A]">Utilizamos cookies essenciais para funcionamento do site e cookies analíticos (ex.: Google Analytics) para entender o uso do site.</p>

        <h2 className="text-xl font-extrabold" style={{ color: '#000' }}>3. Gerenciamento</h2>
        <p className="text-[#00754A]">Você pode apagar ou bloquear cookies via configurações do navegador. Note que funcionalidades podem ser impactadas.</p>

        <h2 className="text-xl font-extrabold" style={{ color: '#000' }}>4. Consentimento</h2>
        <p className="text-[#00754A]">Ao aceitar no banner de cookies, você consente o uso conforme descrito nesta política.</p>
      </section>
    </main>
  );
}
