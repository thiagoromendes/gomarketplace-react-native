import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productString: string | null = await AsyncStorage.getItem(
        'GoMarketplace:product',
      );

      if (productString) {
        setProducts([...JSON.parse(productString)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(item => item.id === product.id);

      if (index === -1) {
        Number((product.quantity = 1));
        setProducts([...products, product]);
      } else {
        const updatedList = products;
        updatedList[index].quantity += 1;

        setProducts([...updatedList]);
      }

      await AsyncStorage.setItem(
        'GoMarketplace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      const updatedList = products;

      updatedList[index].quantity += 1;

      setProducts([...updatedList]);

      await AsyncStorage.setItem(
        'GoMarketplace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(product => product.id === id);
      const updatedList = products;

      if (updatedList[index].quantity === 1) {
        updatedList.splice(index, 1);
      } else {
        updatedList[index].quantity -= 1;
      }

      setProducts([...updatedList]);

      await AsyncStorage.setItem(
        'GoMarketplace:product',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
