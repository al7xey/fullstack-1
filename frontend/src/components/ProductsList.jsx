import React from 'react';
import ProductItem from './ProductItem';
import './ProductsList.scss';

function ProductsList({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="products-list products-list--empty">
        Товаров пока нет. Создайте первый товар.
      </div>
    );
  }

  return (
    <div className="products-list">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ProductsList;

