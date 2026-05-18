import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='flex flex-col bg-dark p-10 text-light-grey w-full border-t border-white/5'>

      {/* On ajoute justify-center et flex-wrap pour le mobile */}
      <div className='flex flex-wrap justify-center gap-12 md:gap-24 text-center md:text-left'>

        <ul className="flex flex-col gap-3">
          <span className="font-title text-white mb-2 tracking-widest">NAVIGATION</span>
          <Link href="/histoire"> <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Notre Histoire</li></Link>
          <Link href="/galerie"><li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Galerie</li></Link>
          <Link href="shop"><li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Shop</li></Link>
        </ul>

        <ul className="flex flex-col gap-3">
          <span className="font-title text-white mb-2 tracking-widest">SUPPORT</span>
          <Link href="contact"><li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Contactez-nous</li></Link>
        
        </ul>

        <ul className="flex flex-col gap-3">
          <span className="font-title text-white mb-2 tracking-widest">SUIVEZ-NOUS</span>
          <a
            href="https://www.instagram.com/oratripfr"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center"
          >  <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Instagram</li></a>
          <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Tiktok</li>
          <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Youtube</li>
          <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Newsletter</li>
        </ul>

        <ul className="flex flex-col gap-3">
          <span className="font-title text-white mb-2 tracking-widest">INFORMATIONS</span>
          <Link href="/cgv">   <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>CGV</li> </Link>
          <Link href="/confidentialité"></Link>    <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Confidentialité</li>
          <Link href="/mention-legales"></Link>    <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Mention Legal</li>
          <Link href="/retours"></Link>    <li className='font-mono text-xs text-gray-500 hover:text-white cursor-pointer transition-colors'>Retour</li>
        </ul>

      </div>

      {/* Copyright */}
      <div className='mt-8 pt-4 border-t border-white/5 text-center font-mono text-[10px] tracking-widest opacity-40 uppercase'>
        © ORA TRIP — 2026 — ALL RIGHTS RESERVED - PAR LORETTA SAMBA
      </div>
    </footer>
  )
}

export default Footer