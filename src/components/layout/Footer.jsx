const Footer = () => {
  return (
    <footer className='flex flex-col bg-dark p-10 text-light-grey w-full border-t border-white/5'>
        
        {/* On ajoute justify-center et flex-wrap pour le mobile */}
        <div className='flex flex-wrap justify-center gap-12 md:gap-24 text-center md:text-left'>
          
          <ul className="flex flex-col gap-3">
            <span className="font-title text-white mb-2 tracking-widest">NAVIGATION</span>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Notre Histoire</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Galerie</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Shop</li>
          </ul>

          <ul className="flex flex-col gap-3">
            <span className="font-title text-white mb-2 tracking-widest">SUPPORT</span>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Contactez-nous</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>FAQ</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Suivi de commande</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Livraison & Retour</li>
          </ul>

          <ul className="flex flex-col gap-3">
            <span className="font-title text-white mb-2 tracking-widest">SUIVEZ-NOUS</span>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Instagram</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Tiktok</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Youtube</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Newsletter</li>
          </ul>

          <ul className="flex flex-col gap-3">
            <span className="font-title text-white mb-2 tracking-widest">INFORMATIONS</span>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>CGV</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Confidentialité</li>
            <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Cookies</li>
          </ul>

        </div>

        {/* Copyright */}
        <div className='mt-8 pt-4 border-t border-white/5 text-center font-mono text-[10px] tracking-widest opacity-40 uppercase'>
           © ORA TRIP — 2026 — ALL RIGHTS RESERVED
        </div> 
    </footer>
  )
}

export default Footer