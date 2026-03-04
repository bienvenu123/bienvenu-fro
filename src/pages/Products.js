import { useState } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
} from 'lucide-react';
import './Products.css';

const sampleProducts = [
  { id: 1, name: 'Gabriela Cashmere Blazer', sku: '114116', price: 113.99, stock: 1113, views: 14012, status: 'Active', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=80&h=80&fit=crop' },
  { id: 2, name: 'Loewe blend Jacket - Blue', sku: '114117', price: 89.99, stock: 721, views: 13212, status: 'Active', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80&h=80&fit=crop' },
  { id: 3, name: 'Sandro - Jacket - Black', sku: '114118', price: 156.00, stock: 407, views: 8201, status: 'Active', image: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=80&h=80&fit=crop' },
  { id: 4, name: 'Adidas By Stella McCartney', sku: '114119', price: 199.99, stock: 892, views: 15234, status: 'Active', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&h=80&fit=crop' },
  { id: 5, name: 'Meteo Hooded Wool Jacket', sku: '114120', price: 78.50, stock: 534, views: 6789, status: 'Active', image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?w=80&h=80&fit=crop' },
  { id: 6, name: 'Hida Down Ski Jacket - Red', sku: '114121', price: 245.00, stock: 223, views: 9234, status: 'Active', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=80&h=80&fit=crop' },
  { id: 7, name: 'Dolce & Gabbana', sku: '114122', price: 425.00, stock: 89, views: 15678, status: 'Active', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=80&h=80&fit=crop' },
];

function Products() {
  const [viewMode, setViewMode] = useState('list');
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === sampleProducts.length ? [] : sampleProducts.map(p => p.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="products-page">
      <div className="products-toolbar">
        <div className="products-toolbar-left">
          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} aria-label="Grid view">
              <LayoutGrid size={18} />
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} aria-label="List view">
              <List size={18} />
            </button>
          </div>
          <div className="products-search">
            <Search size={16} />
            <input type="text" placeholder="Search customer..." />
          </div>
          <select className="products-select"><option>Show: All Products</option></select>
          <select className="products-select"><option>Sort by: Default</option></select>
          <button className="filter-btn"><Filter size={16} /> Filter</button>
        </div>
        <button className="add-product-btn"><Plus size={18} /> Add Product</button>
      </div>

      <div className="products-filters">
        <div className="filter-group">
          <label>Category</label>
          <select><option>Jackets (132)</option></select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select><option>All Status</option></select>
        </div>
        <div className="filter-group">
          <label>Price</label>
          <select><option>$50 - $100</option></select>
        </div>
        <div className="filter-group">
          <label>Store</label>
          <select><option>All Store</option></select>
        </div>
      </div>

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedIds.length === sampleProducts.length} onChange={toggleSelectAll} /></th>
              <th>Product Name <ChevronDown size={14} /></th>
              <th>Purchase Unit Price <ChevronDown size={14} /></th>
              <th>Products <ChevronDown size={14} /></th>
              <th>Views <ChevronDown size={14} /></th>
              <th>Status <ChevronDown size={14} /></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sampleProducts.map(product => (
              <tr key={product.id}>
                <td><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                <td>
                  <div className="product-cell">
                    <img src={product.image} alt={product.name} className="product-thumb" />
                    <div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-sku">SKU: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock.toLocaleString()}</td>
                <td>{product.views.toLocaleString()}</td>
                <td>
                  <button className="status-btn"><span className="status-dot"></span>{product.status}<ChevronDown size={12} /></button>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="edit-btn"><Pencil size={14} /> Edit</button>
                    <button className="delete-btn" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="products-pagination">
        <button className="pagination-btn">Previous</button>
        <div className="pagination-numbers">
          <button className="pagination-num">1</button>
          <button className="pagination-num">2</button>
          <button className="pagination-num active">3</button>
          <button className="pagination-num">4</button>
          <button className="pagination-num">5</button>
          <button className="pagination-num">6</button>
          <span className="pagination-ellipsis">...</span>
          <button className="pagination-num">24</button>
        </div>
        <button className="pagination-btn">Next</button>
      </div>
    </div>
  );
}

export default Products;
