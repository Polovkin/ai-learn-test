import { ProductCard } from '../components/ProductCard'
import type { Product } from '../components/productTypes'

const product: Product = {
  id: 'keyboard-01',
  title: 'Mechanical Keyboard',
  price: 129,
  imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
}

function BuyButton({ productId }: { productId: string }) {
  return <button type="button">Buy {productId}</button>
}

function CompoundProductCardPage() {
  return (
    <main className="tokenizer-page">
      <section className="tokenizer-panel" aria-labelledby="compound-product-title">
        <div className="intro">
          <p className="eyebrow">React pattern</p>
          <h1 id="compound-product-title">Compound Components</h1>
          <p>
            Замість набору boolean props батьківський компонент дає product через
            context, а дочірні частини самі читають потрібні дані.
          </p>
        </div>

        <div className="compound-example">
          <ProductCard product={product}>
            <ProductCard.Image />
            <ProductCard.Content>
              <ProductCard.Title />
              <ProductCard.Price />
            </ProductCard.Content>
            <BuyButton productId={product.id} />
          </ProductCard>
        </div>
      </section>
    </main>
  )
}

export default CompoundProductCardPage
