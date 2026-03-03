import React, { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../api';
import ProductsList from '../../components/ProductsList';
import ProductModal from '../../components/ProductModal';
import './ProductsPage.scss';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleCreate = async (payload) => {
    try {
      const created = await createProduct(payload);
      setProducts((prev) => [...prev, created]);
      setModalOpen(false);
    } catch (err) {
      setError('Не удалось создать товар');
    }
  };

  const handleUpdate = async (payload) => {
    if (!selectedProduct) return;
    try {
      const updated = await updateProduct(selectedProduct.id, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setModalOpen(false);
    } catch (err) {
      setError('Не удалось обновить товар');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError('Не удалось удалить товар');
    }
  };

  const handleModalSubmit = (payload) => {
    if (modalMode === 'create') {
      handleCreate(payload);
    } else {
      handleUpdate(payload);
    }
  };

  return (
    <div className="products-page">
      <header className="products-page__header">
        <div>
          <h1 className="products-page__title">Интернет-магазин</h1>
          <p className="products-page__subtitle">
            Простое демо CRUD-приложения на React + Express
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary products-page__create-btn"
          onClick={openCreateModal}
        >
          + Создать товар
        </button>
      </header>

      <main>
        {loading && <div className="products-page__status">Загрузка...</div>}
        {error && (
          <div className="products-page__status products-page__status--error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <ProductsList
            products={products}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}
      </main>

      <footer className="products-page__footer">
        <span>Backend: http://localhost:3000/api</span>
        <span>Swagger: http://localhost:3000/api-docs</span>
      </footer>

      <ProductModal
        isOpen={modalOpen}
        mode={modalMode}
        product={selectedProduct}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default ProductsPage;

