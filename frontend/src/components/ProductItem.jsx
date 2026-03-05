import React from 'react';
import './ProductItem.scss';

function ProductItem({ product, onEdit, onDelete }) {
  const handleDeleteClick = () => {
    if (window.confirm(`Удалить товар "${product.name}"?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="product-item">
      <div className="product-item__header">
        <span className="product-item__id">#{product.id}</span>
        <span className="product-item__category">{product.category}</span>
      </div>
      <h3 className="product-item__name">{product.name}</h3>
      <p className="product-item__description">{product.description}</p>

      <div className="product-item__meta">
        <span className="product-item__price">
          {product.price.toLocaleString('ru-RU')} ₽
        </span>
        <span className="product-item__stock">На складе: {product.stock}</span>
      </div>

      {product.imageUrl && (
        <div className="product-item__image-wrapper">
          <img
            className="product-item__image"
            src={product.imageUrl}
            alt={product.name}
          />
        </div>
      )}

      <div className="product-item__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => onEdit(product)}
        >
          Редактировать
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={handleDeleteClick}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}

export default ProductItem;
