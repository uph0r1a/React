import { useEffect, useState } from 'react';


function ProductFetcher() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Mô phỏng API fetch
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(item => ({
          id: item.id,
          name: item.title,
          price: Math.floor(Math.random() * 10000000),
          description: item.body
        }));
        setProducts(mapped);
      });
  }, []);

  return (
    <>
      <h2>Sản phẩm từ API giả</h2>
      {products.map(p => (
        <ProductCard key={p.id} {...p} />
      ))}
    </>
  );
}
export default ProductFetcher