import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Filter } from 'lucide-react';
import { useMockStore } from '../store/mockStore';
import { CustomerNavHeader } from '../components/customer/CustomerNavHeader';
import { CustomerDishCard } from '../components/customer/CustomerDishCard';
import { CustomerDishModal } from '../components/customer/CustomerDishModal';
import { CustomerAIRecommendations } from '../components/customer/CustomerAIRecommendations';
import { CustomerSharedCart } from '../components/customer/CustomerSharedCart';
import { CustomerEmptyState } from '../components/customer/CustomerEmptyState';

export const CustomerQRMenuScreen = () => {
  const {
    menuItems,
    cartItems,
    addToCart,
    submitCustomerOrder,
    setCustomerScreen
  } = useMockStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'name'
  const [hide86, setHide86] = useState(false);

  // Customization modal state
  const [customizingDish, setCustomizingDish] = useState(null);

  const categories = ['All', 'Hotpot', 'BBQ / Grill', 'Appetizers', 'Drinks'];

  // Filtered & sorted dishes
  const filteredDishes = useMemo(() => {
    return menuItems
      .filter((dish) => {
        // Category filter
        if (selectedCategory !== 'All' && dish.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = dish.name.toLowerCase().includes(q);
          const matchDesc = dish.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }

        // Hide 86 out-of-stock items if toggled
        if (hide86 && dish.is86) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        return 0; // 'featured' retains natural menu ordering
      });
  }, [menuItems, selectedCategory, searchQuery, sortOrder, hide86]);

  const handleQuickAdd = (dish) => {
    addToCart(dish, dish.modifiers?.[0]?.name || 'Default', 'Guest-A (You)', 1, '');
  };

  const handleCustomAddToCart = (dish, modifier, diner, quantity, notes) => {
    addToCart(dish, modifier, diner, quantity, notes);
  };

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Persistent Customer Navigation Header (SCR-CUST-03) */}
      <CustomerNavHeader
        activeTab="menu"
        onSelectTab={(tab) => setCustomerScreen(tab)}
        cartItemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => {
          const cartEl = document.getElementById('shared-cart-section');
          if (cartEl) cartEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Search & Filter Toolbar */}
      <div
        style={{
          padding: '12px 14px 8px 14px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', color: '#64748b', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search menu (e.g. Hotpot, Salmon, Tea)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '13px'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort & Availability Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={12} color="#64748b" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="featured">Featured Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: '#64748b',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={hide86}
              onChange={(e) => setHide86(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Hide Unavailable</span>
          </label>
        </div>
      </div>

      {/* Category Filter Pills (Scrollable) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          overflowX: 'auto'
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: isSelected ? 800 : 600,
                backgroundColor: isSelected ? '#0f766e' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: `1px solid ${isSelected ? '#0f766e' : '#cbd5e1'}`,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Menu Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Apriori AI Recommender Carousel (FR-004) */}
        <CustomerAIRecommendations onQuickAddDish={handleQuickAdd} />

        {/* Dishes List */}
        {filteredDishes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredDishes.map((dish) => (
              <CustomerDishCard
                key={dish.id}
                dish={dish}
                onQuickAdd={handleQuickAdd}
                onCustomize={(d) => setCustomizingDish(d)}
                hasPairing={dish.id === 'DISH-101' || dish.id === 'DISH-102'}
              />
            ))}
          </div>
        ) : (
          <CustomerEmptyState
            type="search"
            query={searchQuery}
            onReset={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setHide86(false);
            }}
          />
        )}

        {/* Shared Table Cart Section (SCR-CUST-03) */}
        <div id="shared-cart-section" style={{ marginTop: '8px' }}>
          <CustomerSharedCart onSubmitOrder={submitCustomerOrder} />
        </div>
      </div>

      {/* Customization Modal */}
      <CustomerDishModal
        isOpen={Boolean(customizingDish)}
        dish={customizingDish}
        onClose={() => setCustomizingDish(null)}
        onAddToCart={handleCustomAddToCart}
      />
    </div>
  );
};
