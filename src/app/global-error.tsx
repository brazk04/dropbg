"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="pt-BR"><body style={{ background: "white", color: "#163b65", fontFamily: "system-ui", padding: "48px 24px" }}>
    <main><h1>Não foi possível abrir o DropBG</h1><p>Tente novamente em alguns instantes.</p>
      <button onClick={retry} style={{ padding: "14px 24px", background: "#163b65", color: "white", borderRadius: 8 }}>Tentar novamente</button>
    </main>
  </body></html>;
}
