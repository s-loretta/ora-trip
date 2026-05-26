import ArchiveClient from "./ArchiveClient";

interface MedusaProduct {
  id: string;
  title: string;
  year: string;
  origin: string;
  imagePath: string;
  history: string;
}

async function getJerseys() {
  // On construit l'URL de base (Vérifie si tu as besoin de /api avant /store)
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
  const endpoint = `${baseUrl}/store/products`;

  try {
    console.log("📡 Tentative de connexion à Medusa :", endpoint);

    const res = await fetch(endpoint, {
      next: { revalidate: 60 },
      // ⚡️ Si Medusa exige ta clé publique, il faut la décommenter et l'ajouter ici :
      // headers: {
      //   "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      // }
    });

    if (!res.ok) {
      // C'est ici qu'on va attraper l'erreur exacte renvoyée par Railway
      const errorText = await res.text();
      console.error(`❌ Erreur Medusa (${res.status}) :`, errorText);
      return [];
    }

    const data = await res.json();
    const products: MedusaProduct[] = data.products || [];
    
    console.log(`✅ ${products.length} maillots récupérés avec succès !`);

    return products.map((product, index) => ({
      id: String(index + 1).padStart(2, '0'),
      realId: product.id,
      name: product.title,
      year: product.year,
      culture: product.origin,
      image: product.imagePath,
      inspiration: product.history
    }));
  } catch (error) {
    console.error("💥 Crash serveur lors du fetch :", error);
    return [];
  }
}

export default async function Page() {
  const jerseys = await getJerseys();

  return <ArchiveClient jerseys={jerseys} />;
}