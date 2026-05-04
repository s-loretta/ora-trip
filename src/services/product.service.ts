import { medusaClient } from "@/lib/medusa/client";

// Notre typage strict ORA TRIP
export interface ProductData {
  id: string;
  title: string;
  year: string; 
  origin: string; 
  material: string; 
  history: string; 
  value: string; 
  imagePath: string; 
  formats: string[]; 
  maxAllocation: number; 
}

export const  ProductService = {
  /**
   * Récupère l'inventaire depuis le Cerveau (Medusa)
   * et le traduit dans le format de notre Galerie.
   */
  async fetchInventory(): Promise<ProductData[]> {
    try {
      const { products } = await medusaClient.products.list();
      
      // Traduction des données brutes Medusa en "Pièces" ORA TRIP
      return products.map((product) => {
        // Recherche de l'option "Format" (Taille)
        const formatOption = product.options?.find((opt) => opt.title.toLowerCase() === "format");
        const formats = formatOption ? formatOption.values.map(v => v.value) : [];

        // Calcul de l'allocation maximale (stock total de la pièce)
        const maxAllocation = product.variants?.reduce((acc, variant) => acc + (variant.inventory_quantity || 0), 0) || 0;

        // Formatage de la valeur monétaire (prix de la première variante)
        const priceAmount = product.variants?.[0]?.prices?.[0]?.amount || 0;
        // Medusa stocke les prix en centimes, on divise par 100
        const formattedValue = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(priceAmount / 100);

        return {
          // Fallbacks stricts pour satisfaire TypeScript
          id: product.id || "id-inconnu",
          title: product.title || "Œuvre Anonyme",
          
          // Nous utilisons les metadata de Medusa pour les infos éditoriales
          year: (product.metadata?.year as string) || "Archive",
          origin: (product.metadata?.origin as string) || "Studio ORA",
          material: product.material || "Non spécifié",
          history: product.description || "Aucune histoire n'a encore été écrite pour cette pièce.",
          value: formattedValue,
          imagePath: product.thumbnail || "/placeholder-maillot.png",
          formats: [...new Set(formats)], // Déduplication des formats
          maxAllocation: maxAllocation,
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'inventaire ORA TRIP:", error);
      return [];
    }
  }
};