import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import axios from 'axios';

const App = () => {
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://fakestoreapi.com/products");
      console.log(response.data);
      
      setProducts(response.data ?? []);
    } catch (error) {
      console.error("Cant fetch data", error);

    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} products={products} />)}
    </div>
  );
}

export default App
