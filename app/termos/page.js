export const metadata = {
  title: 'BEREIA — Termos de Uso',
  description: 'Termos de uso da plataforma BEREIA de estudo bíblico.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-2xl mx-auto px-5 pt-10">

        {/* Header */}
        <a href="https://bereiaestudos.com.br" className="inline-flex items-center gap-2 mb-8 text-bereia-600 text-sm hover:text-bereia-800">
          ← Voltar ao BEREIA
        </a>

        <h1 className="text-2xl font-bold text-bereia-950 font-serif mb-2">Termos de Uso</h1>
        <p className="text-xs text-bereia-500 mb-8">Última atualização: Fevereiro de 2026</p>

        <div className="space-y-6 text-sm text-bereia-800 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">1. Sobre o BEREIA</h2>
            <p>
              O BEREIA é uma ferramenta <strong>100% gratuita</strong> de estudo bíblico, desenvolvida com o propósito 
              de auxiliar na evangelização e no aprofundamento do conhecimento das Escrituras Sagradas. 
              O nome é inspirado em Atos 17:11, que descreve os bereanos como pessoas que 
              "examinavam as Escrituras todos os dias para ver se as coisas eram de fato assim".
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">2. Gratuidade</h2>
            <p>
              O BEREIA é e sempre será gratuito. Não há planos pagos, assinaturas, taxas ocultas ou 
              qualquer forma de monetização. Este é um projeto vocacional a serviço do Reino de Deus 
              e da edificação do povo.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">3. Natureza do Conteúdo</h2>
            <p>
              O BEREIA utiliza inteligência artificial para auxiliar no estudo bíblico. As respostas 
              são geradas com base em conhecimento teológico, histórico e contextual, mas <strong>não 
              substituem</strong>:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              <li className="flex gap-2"><span className="text-bereia-500">•</span> A leitura direta e pessoal da Bíblia</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> O aconselhamento pastoral</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> O acompanhamento profissional (psicológico, médico, jurídico)</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> A comunhão e o ensino da igreja local</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">4. Limitações</h2>
            <p>
              Por utilizar inteligência artificial, o BEREIA pode ocasionalmente:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Apresentar imprecisões em referências bíblicas</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Oferecer interpretações que não representam todas as visões cristãs</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Não captar nuances específicas de determinado contexto denominacional</li>
            </ul>
            <p className="mt-2">
              Recomendamos sempre verificar as referências bíblicas citadas e consultar líderes 
              espirituais de sua confiança para questões de fé e prática.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">5. Privacidade</h2>
            <p>
              O BEREIA <strong>não coleta dados pessoais</strong>. Não exigimos cadastro, login ou 
              qualquer informação pessoal. As consultas realizadas não são armazenadas de forma 
              permanente vinculada ao usuário. Utilizamos apenas cache temporário para otimizar 
              o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">6. Posicionamento</h2>
            <p>
              O BEREIA é uma ferramenta cristã de estudo bíblico. Buscamos apresentar diferentes 
              formas de interpretar as Escrituras com respeito e fundamentação bíblica, sem promover 
              ou depreciar qualquer denominação específica. Nosso compromisso é com o texto bíblico 
              e com a edificação de quem busca compreendê-lo.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">7. Uso Responsável</h2>
            <p>
              Ao utilizar o BEREIA, você se compromete a:
            </p>
            <ul className="mt-2 space-y-1 pl-4">
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Usar a ferramenta para fins de estudo e edificação</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Não utilizar as respostas para promover divisão ou contenda</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Verificar as referências bíblicas antes de citá-las</li>
              <li className="flex gap-2"><span className="text-bereia-500">•</span> Buscar ajuda profissional quando necessário (saúde mental, crises, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-bereia-950 mb-2">8. Desenvolvimento</h2>
            <p>
              O BEREIA é desenvolvido por <a href="https://inventaresolutions.com.br" target="_blank" rel="noopener noreferrer" className="text-bereia-600 underline underline-offset-2 font-semibold">Inventare Solutions</a> como 
              um projeto vocacional. Sugestões, correções e contribuições são bem-vindas.
            </p>
          </section>

          <section className="bg-bereia-100 rounded-2xl p-5 border border-bereia-300/50">
            <p className="text-bereia-700 italic font-serif text-center leading-relaxed">
              "Ora, estes de Bereia eram mais nobres que os de Tessalônica, pois receberam 
              a palavra com toda a avidez, examinando as Escrituras todos os dias para ver 
              se as coisas eram de fato assim."
            </p>
            <p className="text-center text-bereia-500 text-xs mt-2 font-semibold">Atos 17:11</p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-bereia-300/50 text-center">
          <p className="text-[10px] text-bereia-400">
            BEREIA  |  www.bereiaestudos.com.br  |  100% Gratuito
          </p>
          <p className="text-[10px] text-bereia-400 mt-1">
            Desenvolvido por <a href="https://inventaresolutions.com.br" target="_blank" rel="noopener noreferrer" className="text-bereia-600 underline underline-offset-2">Inventare Solutions</a>
          </p>
        </div>

      </div>
    </div>
  );
}
