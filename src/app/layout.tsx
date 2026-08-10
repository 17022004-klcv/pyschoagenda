import "./globals.css";

export const metadata = {
  title: "Psychoagenda",
  description: "Sistema de gestión para Centro Psicológico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
