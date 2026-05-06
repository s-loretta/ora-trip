import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/CartDrawer"; // Injection du composant d'inventaire
import NotificationModal from "@/components/NotificationModal";
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
  title: "ORA TRIP | L'Archive Culturelle",
  description: "Des maillots de football transformés en objets culturels et intemporels.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      {/* 
        APPLICATION STRICTE DU DESIGN SYSTEM :
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
        <Navbar />
        <NotificationModal />
        
        {/* LE TIROIR GLOBAL : Reste invisible et inactif jusqu'à son déclenchement */}
        <CartDrawer />
        
        {/* CONTENU DE LA PAGE : On utilise flex-grow pour pousser le footer vers le bas */}
        <main className="flex-grow w-full">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}