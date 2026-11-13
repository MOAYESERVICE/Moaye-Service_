import Link from "next/link";
import PhotoSlot from "@/components/ui/PhotoSlot";
import { getHomepagePhotos } from "@/lib/homepage";

export default async function ProductsSection() {
  const homepagePhotos = await getHomepagePhotos();

  return (
    <section className="section section-mist">
      <div className="wrap">
        <div className="product-section-heading">
          <div className="product-section-copy">
            <span className="product-section-eyebrow">Nos produits</span>
            <h2 className="h2">Tout pour faire grandir votre activité</h2>
            <p className="lead">Aliments, animaux d&apos;élevage, équipements et intrants : trouvez les essentiels pour accompagner chaque étape de votre élevage.</p>
          </div>
          <Link className="btn btn-green product-catalogue-link" href="/produits">Découvrir le catalogue</Link>
        </div>
        <div className="product-category-grid" aria-label="Produits à découvrir">
          {homepagePhotos.map((card, index) => (
            <Link
              key={card.productKey}
              href={card.productId ? `/produits/${card.productId}` : "/produits"}
              className="card product-category-card"
              aria-label={`Voir ${card.title}`}
              style={{ zIndex: index + 1 }}
            >
              <div className="product-category-photo">
                <PhotoSlot
                  label={card.title}
                  src={card.imageUrl}
                  fit={card.productKey === "p2" || card.productKey === "p3" ? "contain" : "cover"}
                  showLabel={false}
                  alt={card.alt}
                />
              </div>
              <span className="product-category-shade" aria-hidden="true" />
              <span className="product-category-content">
                <strong>{card.title}</strong>
                <span>Voir le produit</span>
              </span>
            </Link>
          ))}
        </div>
        <p className="product-order-message">
          Trouvez les produits adaptés à votre activité et passez votre commande en quelques clics.
        </p>
      </div>
    </section>
  );
}
