import React from 'react';
import { useMockStore } from '../store/mockStore';
import { CustomerNavHeader } from '../components/customer/CustomerNavHeader';
import { CustomerReservationWizard } from '../components/customer/CustomerReservationWizard';

export const CustomerReservationScreen = () => {
  const { cartItems, setCustomerScreen } = useMockStore();

  return (
    <div className="device-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Persistent Customer Navigation Header */}
      <CustomerNavHeader
        activeTab="reserve"
        onSelectTab={(tab) => setCustomerScreen(tab)}
        cartItemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setCustomerScreen('menu')}
      />

      {/* Reservation Wizard Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <CustomerReservationWizard
          onReturnToMenu={() => setCustomerScreen('menu')}
        />
      </div>
    </div>
  );
};
