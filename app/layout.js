import "./globals.css";

export const metadata = {
  title: "Forest Bar Sales Log",
  description: "Registro de vendas do Forest Bar",
  icons: {
    icon: "/forest-bar.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
