import React, { useEffect, useState } from 'react';
import './ProductModal.scss';

const initialFormState = {
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: ''
};

function ProductModal({ isOpen, mode, product, onClose, onSubmit }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isOpen && mode === 'edit' && product) {
      setForm({
        name: product.name ?? '',
        category: product.category ?? '',
        description: product.description ?? '',
        price: product.price != null ? String(product.price) : '',
        stock: product.stock != null ? String(product.stock) : '',
        imageUrl: product.imageUrl ?? ''
      });
    } else if (isOpen && mode === 'create') {
      setForm(initialFormState);
    }
  }, [isOpen, mode, product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const currentErrors = [];

    if (!form.name.trim()) currentErrors.push('Название обязательно');
    if (!form.category.trim()) currentErrors.push('Категория обязательна');
    if (!form.description.trim()) currentErrors.push('Описание обязательно');

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price)) currentErrors.push('Цена должна быть числом');
    if (!Number.isFinite(stock)) currentErrors.push('Количество на складе должно быть числом');

    setErrors(currentErrors);
    return currentErrors.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || undefined
    };

    onSubmit(payload);
  };

  const title = mode === 'create' ? 'Создание товара' : 'Редактирование товара';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {errors.length > 0 && (
          <div className="modal__errors">
            {errors.map((err) => (
              <div key={err} className="modal__error">
                {err}
              </div>
            ))}
          </div>
        )}

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label htmlFor="name">Название *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Например, Смартфон Galaxy X1"
            />
          </div>

          <div className="modal__field">
            <label htmlFor="category">Категория *</label>
            <input
              id="category"
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              placeholder="Электроника, Одежда, Книги..."
            />
          </div>

          <div className="modal__field">
            <label htmlFor="description">Описание *</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Краткое описание товара"
            />
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label htmlFor="price">Цена, ₽ *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="modal__field">
              <label htmlFor="stock">На складе *</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="modal__field">
            <label htmlFor="imageUrl">URL изображения</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {mode === 'create' ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;

