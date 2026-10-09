"use client";

/** Dipakai bila root layout sendiri gagal; harus membawa <html> dan <body> sendiri. */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Terjadi kesalahan</h1>
          <p style={{ color: "#525252", maxWidth: 360 }}>Maaf, aplikasi gagal dimuat. Silakan coba lagi.</p>
          {error.digest && <p style={{ color: "#a3a3a3", fontSize: 12 }}>Kode: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              minHeight: 44,
              padding: "0 20px",
              borderRadius: 6,
              border: 0,
              background: "#171717",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
