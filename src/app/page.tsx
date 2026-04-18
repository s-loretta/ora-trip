import Preloader from "@/components/layout/Preloader";

export default function Home() {
  return (
    <>
    <Preloader />
    <main className="relative h-screen w-full overflow-hidden text-light-grey">
      
      {/* 1. L'image en arrière-plan */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/image1.jpg" 
          alt="Background Maillot" 
          className="h-full w-full object-cover object-top " 
        />
        {/* Optionnel : Un voile noir pour faire ressortir le bouton */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 2. Le contenu par-dessus */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        
        {/* Ton titre avec la police BBH Bogle */}
        <h1 className="font-title tracking-wider text-6xl md:text-8xl mb-8 tracking-tighter text-light-grey mt-50">
          ORA TRIP
        </h1>

        {/* Ton bouton avec la police IBM Plex Mono */}
        <button className="font-title text-2xl  md:text-6xl tracking-widest  text-black px-10 py-4  transition-all duration-300 rounded-full border-8 text-light-grey border-light-grey hover:bg-light-grey hover:text-dark ">
          SHOP NOW
        </button>
        
      </div>

    </main>
    </>
  );
}