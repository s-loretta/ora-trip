import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/CartDrawer"; // Injection du composant d'inventaire
import NotificationModal from "@/components/NotificationModal";
import LenisProvider from '@/components/LenisProvider';
import Prefetcher from "@/components/Prefetcher";
// --- CONFIGURATION TYPOGRAPHIQUE (ORA TRIP ADN) ---

// Font Title (Serif/Italique pour les grands titres)
const bbhBogle = localFont({
  src: "./fonts/BBHBogle-Regular.ttf",
  variable: "--font-bbh-bogle",
  display: 'swap',
});

// Font Mono (Pour les données techniques, labels et détails)
const ibmPlexMono = localFont({
  src: "./fonts/IBMPlexMono-Regular.ttf",
  variable: "--font-ibm-plex",
  display: 'swap',
});

// --- METADATA GLOBALES ---
export const metadata = {
  title: "ORA TRIP ",
  description: "Des maillots de football transformés en objets culturels et intemporels.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🚨 ATTENTION : Suppression de "scroll-smooth" pour laisser Lenis gérer la physique
    <html lang="fr">
      <head>
        {/* Preconnect Stripe — réduit la latence du PaymentElement */}
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preconnect" href="https://pub-e56a1544e7114f1a8d7a3186235650e0.r2.dev" />
<link rel="dns-prefetch" href="https://pub-e56a1544e7114f1a8d7a3186235650e0.r2.dev" />
        {/* Preconnect Railway (backend Medusa) */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL} />
      </head>
      {/* APPLICATION STRICTE DU DESIGN SYSTEM :
        - bg-dark (#131313) et text-light-grey (#C3C3C3) obligatoires à la racine.
        - selection:bg-white selection:text-dark pour une interaction texte premium.
      */}
      <body 
        className={`
          ${bbhBogle.variable} 
          ${ibmPlexMono.variable} 
          antialiased 
          bg-dark text-light-grey 
          selection:bg-white selection:text-dark
          flex flex-col min-h-screen
        `}
      >
        {/* ⚡️ LE MOTEUR LENIS ENVELOPPE TOUTE L'APPLICATION */}
        <LenisProvider>
          <Navbar />
          <NotificationModal />
          <Prefetcher />
          {/* LE TIROIR GLOBAL : Reste invisible et inactif jusqu'à son déclenchement */}
          <CartDrawer />
          
          {/* CONTENU DE LA PAGE : On utilise flex-grow pour pousser le footer vers le bas */}
          <main className="flex-grow w-full">
            {children}
          </main>
          
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}