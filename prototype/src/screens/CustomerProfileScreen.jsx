import React from 'react';
import { useMockStore } from '../store/mockStore';
import { CustomerNavHeader } from '../components/customer/CustomerNavHeader';
import { CustomerProfileView } from '../components/customer/CustomerProfileView';

export const CustomerProfileScreen = () => {
  const { cartItems, setCustomerScreen } = useMockStore();

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Persistent Customer Navigation Header */}
      <CustomerNavHeader
        activeTab="profile"
        onSelectTab={(tab) => setCustomerScreen(tab)}
        cartItemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setCustomerScreen('menu')}
      />

      {/* Profile & Loyalty Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CustomerProfileView
          onNavigateToMenu={() => setCustomerScreen('menu')}
          onNavigateToReserve={() => setCustomerScreen('reserve')}
        />
      </div>
    </div>
  );
};
