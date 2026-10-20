import React, { useState, useMemo } from 'react';
import { useMockStore } from '../store/mockStore';
import { MOCK_MEMBERS, MOCK_COUPONS } from '../mock/data';

// Modular Cashier Components
import { CashierHeader } from '../components/cashier/CashierHeader';
import { CashierBillQueue } from '../components/cashier/CashierBillQueue';
import { CashierInvoicePanel } from '../components/cashier/CashierInvoicePanel';
import { CashierSettlementPanel } from '../components/cashier/CashierSettlementPanel';
import { CashierPaymentModal } from '../components/cashier/CashierPaymentModal';
import { CashierReceiptModal } from '../components/cashier/CashierReceiptModal';
import { CashierApprovalRequestModal } from '../components/cashier/CashierApprovalRequestModal';
import { CashierHistoryDrawer } from '../components/cashier/CashierHistoryDrawer';

/**
 * CashierPOSScreen (SCR-POS-01)
 * High-performance, 3-column orchestrator for Cashier POS billing terminal.
 * Connects 9 modular sub-components with shared store state, enforces
 * PRD Rule 6 (cooking blocker) and PRD Rule 7 (40% discount cap),
 * and provides seamless escalation to Manager Approvals Queue.
 */
export const CashierPOSScreen = () => {
  const {
    tables,
    kdsTickets,
    menuItems,
    cashierSettledHistory,
    cashierShiftSales,
    settleCashierInvoice,
    requestCashierApproval,
    resetAllPrototypeData,
    showToast
  } = useMockStore();

  // Active table selection
  const [selectedTableId, setSelectedTableId] = useState('T08');

  // Customer Loyalty & Coupon state
  const [memberProfile, setMemberProfile] = useState(MOCK_MEMBERS['0912345678']);
  const [appliedCoupon, setAppliedCoupon] = useState(MOCK_COUPONS['HAPPYHOUR']);

  // Modals and Drawers visibility
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Modal payload payloads
  const [approvalModalData, setApprovalModalData] = useState({});
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  // Tables awaiting settlement (Occupied, billRequested, or checkoutQueue)
  const settlementTables = useMemo(() => {
    return tables.filter(
      (t) => t.status === 'Occupied' || t.checkoutQueue || t.billRequested
    );
  }, [tables]);

  const activeTableId = settlementTables.some((t) => t.id === selectedTableId)
    ? selectedTableId
    : settlementTables[0]?.id || selectedTableId;

  const selectedTable = tables.find((t) => t.id === activeTableId) || tables[0];

  // Dynamic derivation of table invoice items from live KDS tickets & menu items
  const getTableInvoiceItems = (tableId) => {
    const ticketsForTable = kdsTickets.filter((t) => t.tableId === tableId);
    if (ticketsForTable.length > 0) {
      const dynamicItems = ticketsForTable
        .flatMap((t) => t.items)
        .map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.dishId);
          const price = menuItem ? menuItem.price : 100000;
          return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price,
            status: item.status,
            modifier: item.modifier
          };
        });
      if (dynamicItems.length > 0) return dynamicItems;
    }

    // Baseline fallbacks for demonstrator tables
    if (tableId === 'T08') {
      return [
        { id: 'FB-01', name: 'Fresh Atlantic Salmon Fillet', quantity: 1, price: 220000, status: 'Served' },
        { id: 'FB-02', name: 'Spring Rolls Platter', quantity: 1, price: 150000, status: 'Served' }
      ];
    }
    if (tableId === 'T03') {
      return [
        { id: 'FB-03', name: 'Grilled Ribeye Steak', quantity: 2, price: 250000, status: 'Cooking', modifier: 'Medium Rare' },
        { id: 'FB-04', name: 'Seafood Spicy Hotpot', quantity: 1, price: 280000, status: 'Cooking', modifier: 'Less Spicy' },
        { id: 'FB-05', name: 'Iced Herbal Tea', quantity: 2, price: 20000, status: 'Served' }
      ];
    }
    if (tableId === 'T02') {
      return [
        { id: 'FB-06', name: 'Spring Rolls Platter', quantity: 1, price: 150000, status: 'Served' }
      ];
    }
    if (tableId === 'T10') {
      return [
        { id: 'FB-07', name: 'Grilled Ribeye Steak', quantity: 3, price: 250000, status: 'Served', modifier: 'Medium' },
        { id: 'FB-08', name: 'Fresh Atlantic Salmon Fillet', quantity: 2, price: 220000, status: 'Served' },
        { id: 'FB-09', name: 'Iced Herbal Tea', quantity: 3, price: 20000, status: 'Served' }
      ];
    }
    if (tableId === 'TAK-01') {
      return [
        { id: 'FB-10', name: 'Seafood Spicy Hotpot', quantity: 1, price: 280000, status: 'Served', modifier: 'Extra Spicy' }
      ];
    }

    return [
      { id: 'FB-DEF', name: 'Dine-In Menu Order', quantity: 1, price: selectedTable?.billAmount || 150000, status: 'Served' }
    ];
  };

  const invoiceItems = getTableInvoiceItems(activeTableId);
  const subtotal = invoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Check if any line items are currently cooking or pending
  const hasUnservedCooking = invoiceItems.some(
    (item) => item.status === 'Cooking' || item.status === 'Pending'
  );

  // Discount calculations (PRD Rule 7: 40% cap)
  const memberDiscountPct = memberProfile ? memberProfile.tierDiscountPct : 0;
  const couponDiscountPct = appliedCoupon ? appliedCoupon.discountPct : 0;
  const rawTotalDiscountPct = memberDiscountPct + couponDiscountPct;
  const effectiveDiscountPct = Math.min(rawTotalDiscountPct, 40);
  const totalDiscountAmount = Math.round((subtotal * effectiveDiscountPct) / 100);
  const totalPayable = Math.max(0, subtotal - totalDiscountAmount);
  const roundedPayable = Math.round(totalPayable / 1000) * 1000;

  // Handler: Initiate Payment Flow
  const handleProceedPayment = () => {
    if (hasUnservedCooking) {
      showToast('Cannot proceed: Food items are currently cooking on kitchen stations (PRD Rule 6).');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // Handler: Confirm Payment Settlement
  const handleConfirmPayment = ({ method, amountPaid, cashReceived, changeDue, paymentRef }) => {
    setIsPaymentModalOpen(false);

    const discountDetail = memberProfile && appliedCoupon
      ? `${memberProfile.tier} (${memberDiscountPct}%) + ${appliedCoupon.code} (${couponDiscountPct}%) [Capped 40%]`
      : memberProfile
      ? `${memberProfile.tier} Member (${memberDiscountPct}%)`
      : appliedCoupon
      ? `${appliedCoupon.code} Voucher (${couponDiscountPct}%)`
      : 'None';

    const newInvoice = settleCashierInvoice({
      tableId: activeTableId,
      tableName: selectedTable.name,
      orderId: selectedTable.orderId || 'ORD-1045',
      subtotal,
      discountAmount: totalDiscountAmount,
      discountDetail,
      finalTotal: amountPaid,
      paymentMethod: method,
      itemsCount: invoiceItems.length,
      paymentRef
    });

    // Populate receipt data and launch thermal receipt preview
    setActiveReceiptData({
      ...newInvoice,
      items: invoiceItems,
      cashReceived,
      changeDue,
      member: memberProfile
    });
    setIsReceiptModalOpen(true);
  };

  // Handler: Open Void Dish escalation modal
  const handleRequestVoidDish = (itemData) => {
    setApprovalModalData({
      type: 'Void Dish',
      table: itemData.table || selectedTable.name,
      orderId: itemData.orderId || selectedTable.orderId,
      item: itemData.item
    });
    setIsApprovalModalOpen(true);
  };

  // Handler: Open Discount Override escalation modal
  const handleRequestDiscountOverride = (overrideData) => {
    setApprovalModalData({
      type: 'Discount Override',
      table: overrideData.table || selectedTable.name,
      orderId: overrideData.orderId || selectedTable.orderId,
      subtotal: overrideData.subtotal || subtotal
    });
    setIsApprovalModalOpen(true);
  };

  // Handler: Submit escalation to Manager Queue
  const handleApprovalSubmit = (payload) => {
    requestCashierApproval(payload);
  };

  // Handler: View past receipt from History drawer
  const handleSelectHistoryReceipt = (historyInv) => {
    setActiveReceiptData({
      invoiceId: historyInv.invoiceId,
      orderId: historyInv.orderId,
      tableName: historyInv.tableName,
      area: historyInv.area,
      cashierName: historyInv.cashierName,
      items: [
        { name: 'Specialty Banquet Set', quantity: historyInv.itemsCount || 2, price: Math.round(historyInv.subtotal / (historyInv.itemsCount || 2)), status: 'Served' }
      ],
      subtotal: historyInv.subtotal,
      discountAmount: historyInv.discountAmount,
      discountDetail: historyInv.discountDetail,
      finalTotal: historyInv.finalTotal,
      paymentMethod: historyInv.paymentMethod,
      paymentRef: historyInv.paymentRef,
      cashReceived: historyInv.finalTotal,
      changeDue: 0,
      member: null
    });
    setIsHistoryDrawerOpen(false);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="pos-screen-layout device-desktop">
      {/* 1. Header Bar */}
      <CashierHeader
        shiftTotal={cashierShiftSales}
        pendingCount={settlementTables.length}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onReset={resetAllPrototypeData}
      />

      {/* 2. 3-Column POS Desktop Layout */}
      <div className="pos-3col-grid">
        {/* Column 1 (Left): Billing Queue */}
        <CashierBillQueue
          tables={tables}
          selectedTableId={activeTableId}
          onSelectTable={setSelectedTableId}
          getTableInvoiceItems={getTableInvoiceItems}
        />

        {/* Column 2 (Middle): Active Invoice & Line Items */}
        <CashierInvoicePanel
          selectedTable={selectedTable}
          invoiceItems={invoiceItems}
          onRequestVoidDish={handleRequestVoidDish}
          onRequestDiscountOverride={handleRequestDiscountOverride}
        />

        {/* Column 3 (Right): Settlement, Member, Vouchers & Payment CTA */}
        <CashierSettlementPanel
          subtotal={subtotal}
          hasUnservedCooking={hasUnservedCooking}
          memberProfile={memberProfile}
          setMemberProfile={setMemberProfile}
          appliedCoupon={appliedCoupon}
          setAppliedCoupon={setAppliedCoupon}
          onProceedPayment={handleProceedPayment}
          onRequestDiscountOverride={handleRequestDiscountOverride}
        />
      </div>

      {/* 3. Payment Modal (4 Tabs: Cash, Card, VietQR, e-Wallet) */}
      <CashierPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalPayable={roundedPayable}
        tableName={selectedTable.name}
        orderId={selectedTable.orderId || 'ORD-1045'}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* 4. Thermal Receipt Modal (80mm POS Slip Simulation) */}
      <CashierReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        invoiceData={activeReceiptData}
        onPrintThermal={() => showToast('Thermal printer emitted 80mm fiscal receipt slip!')}
      />

      {/* 5. Approval Escalation Modal (Void / Discount Override -> Manager) */}
      <CashierApprovalRequestModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        initialData={approvalModalData}
        onSubmitApproval={handleApprovalSubmit}
      />

      {/* 6. Shift Settled Bills History Drawer */}
      <CashierHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={cashierSettledHistory}
        onSelectReceipt={handleSelectHistoryReceipt}
      />
    </div>
  );
};
