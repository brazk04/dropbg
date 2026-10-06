import { ImageResponse } from "next/og";
export const alt = "DropBG — Remova o fundo. Mantenha o que importa.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 90,
        background: "#ffffff",
        color: "#102a43",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 35,
          color: "#102a43",
          marginBottom: 50,
        }}
      >
        DropBG
      </div>
      <div style={{ fontSize: 72, display: "flex", letterSpacing: -3 }}>
        Remova o fundo.
      </div>
      <div
        style={{
          fontSize: 72,
          display: "flex",
          color: "#163b65",
          letterSpacing: -3,
        }}
      >
        Mantenha o que importa.
      </div>
      <div style={{ fontSize: 25, marginTop: 40, color: "#526477" }}>
        Gratuito. Rápido. Sem cadastro.
      </div>
    </div>,
    size,
  );
}
