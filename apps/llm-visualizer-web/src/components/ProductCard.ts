import {
  ProductCardContent,
  ProductCardImage,
  ProductCardPrice,
  ProductCardRoot,
  ProductCardTitle,
} from './ProductCardParts'

export const ProductCard = Object.assign(ProductCardRoot, {
  Image: ProductCardImage,
  Content: ProductCardContent,
  Title: ProductCardTitle,
  Price: ProductCardPrice,
})
