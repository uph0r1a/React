import React from 'react'

function ProductCard({ products }) {
  return (
    <div>
      <h2>{products.title}</h2>
      <p>Giá: {products.price} VND</p>
      {products.description && <small>{products.description}</small>}
    </div>
  );
}

export default ProductCard