import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

// Configuration de BBH Bogle
const bbhBogle = localFont({
  src: "./fonts/BBHBogle-Regular.ttf", // Passage en .ttf
  variable: "--font-bbh-bogle",
  display: 'swap',
});

// Configuration de IBM Plex Mono
const ibmPlexMono = localFont({
  src: "./fonts/IBMPlexMono-Regular.ttf", // Passage en .ttf
  variable: "--font-ibm-plex",
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${bbhBogle.variable} ${ibmPlexMono.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}