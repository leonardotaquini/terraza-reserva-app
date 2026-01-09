import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "Reservas de Terraza",
  description: "Sistema de reservas para el uso de la terraza comunitaria del edificio",
  generator: "leonardo taquini",
  icons: {
    icon: [
      {
        url: "/Calendar.webp",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/Calendar.webp",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/Calendar",
        type: "image/svg+xml",
      },
    ],
    apple: "/Calendar.webp",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased `}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
