import { createContext, useContext } from 'react'
import type { PropsWithChildren } from 'react'
import type { Product } from './productTypes'

const ProductCardContext = createContext<Product | null>(null)

function useProductCard() {
  const product = useContext(ProductCardContext)

  if (!product) {
    throw new Error('ProductCard components must be used inside <ProductCard>.')
  }

  return product
}

export function ProductCardRoot({ product, children }: PropsWithChildren<{ product: Product }>) {
  return (
    <ProductCardContext value={product}>
      <article className="compound-product-card">{children}</article>
    </ProductCardContext>
  )
}

export function ProductCardImage() {
  const product = useProductCard()

  return <img src={product.imageUrl} alt={product.title} />
}

export function ProductCardContent({ children }: PropsWithChildren) {
  return <div className="compound-product-content">{children}</div>
}

export function ProductCardTitle() {
  const product = useProductCard()

  return <h2>{product.title}</h2>
}

export function ProductCardPrice() {
  const product = useProductCard()

  return <p>${product.price}</p>
}
