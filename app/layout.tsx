import type { Metadata } from "next";
import "./globals.css";
import { Provider } from "./provider";

export const metadata: Metadata = {
  title: "Examen Frontend",
  description: "Creado por Mario Cortés Herrera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <Provider>
        <body className={''}>{children}</body>
      </Provider>
    </html>
  );
}
