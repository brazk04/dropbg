const questions = [
  [
    "O DropBG é gratuito?",
    "Sim. Você pode remover o fundo e baixar o resultado em PNG gratuitamente, sem assinatura.",
  ],
  [
    "Preciso criar uma conta?",
    "Não. Você pode usar o DropBG sem login ou cadastro.",
  ],
  [
    "Quais formatos são suportados?",
    "PNG, JPG, JPEG e WEBP, com até 25 MB, 16 megapixels e 8192 pixels por lado. Você pode selecionar, arrastar ou colar uma imagem. Baixe o PNG transparente ou escolha uma cor ou imagem local para o fundo.",
  ],
  [
    "Minha imagem é enviada para algum servidor?",
    "Não. Tanto a imagem principal quanto o fundo personalizado e a composição ficam no seu dispositivo. A primeira utilização baixa o modelo de IA e o runtime; esses downloads não enviam suas imagens. Os arquivos do modelo podem ficar no cache do navegador.",
  ],
  [
    "O DropBG reduz a qualidade da imagem?",
    "O resultado mantém as dimensões originais e é salvo em PNG. A máscara é estimada por IA, então cabelos, pelos, objetos finos e fundos parecidos com o objeto podem exigir mais cuidado. Não reduzimos sua imagem silenciosamente.",
  ],
];
export function FAQ() {
  return (
    <section className="faq-section container" aria-labelledby="faq-title">
      <div>
        <span className="eyebrow">PERGUNTAS FREQUENTES</span>
        <h2 id="faq-title">O que você precisa saber.</h2>
        <p>Formatos, privacidade e uso da ferramenta.</p>
      </div>
      <div className="faq-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <span className="faq-plus" aria-hidden="true">
                +
              </span>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
