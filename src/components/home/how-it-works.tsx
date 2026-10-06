const steps = [
  {
    title: "Adicione sua imagem",
    text: "Selecione um arquivo, arraste ou use Ctrl + V.",
  },
  {
    title: "Remova o fundo",
    text: "Clique para processar a imagem no seu dispositivo.",
  },
  {
    title: "Baixe o resultado",
    text: "Salve o recorte em PNG, com fundo transparente.",
  },
];
export function HowItWorks() {
  return (
    <section
      className="how-section container"
      id="como-funciona"
      aria-labelledby="how-title"
    >
      <div className="section-intro">
        <div>
          <span className="eyebrow">COMO FUNCIONA</span>
          <h2 id="how-title">Da imagem ao recorte.</h2>
        </div>
        <p>Um fluxo simples, do início ao fim.</p>
      </div>
      <div className="steps">
        {steps.map((step, i) => (
          <article key={step.title}>
            <span className="step-number">0{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
