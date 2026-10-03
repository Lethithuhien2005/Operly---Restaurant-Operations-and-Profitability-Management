import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  MOCK_MENU_ITEMS,
  MOCK_INITIAL_TABLES,
  MOCK_INITIAL_KDS_TICKETS,
  MOCK_MEMBERS,
  MOCK_COUPONS,
  MOCK_RECIPE_BOM,
  MOCK_STAFF_ACCOUNTS,
  MOCK_AUDIT_LOGS,
  MOCK_MANAGER_METRICS
} from '../mock/data';

const MockStoreContext = createContext(null);

export const MockStoreProvider = ({ children }) => {
  // Navigation & Role Harness (Evaluator mechanism across all 6 roles)
  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'kitchen' | 'waiter' | 'cashier' | 'manager' | 'admin'
  const [customerScreen, setCustomerScreen] = useState('menu'); // 'menu' (SCR-CUST-03) | 'progress' (SCR-CUST-04)
  
  // Manager Sub-Tabs (SCR-MGR-01 vs SCR-MGR-02)
  const [managerTab, setManagerTab] = useState('forecast'); // 'forecast' | 'bom'
  const [recipeBOM, setRecipeBOM] = useState(MOCK_RECIPE_BOM);

  // Administrator Sub-Tabs (SCR-ADM-01 vs SCR-ADM-02)
  const [adminTab, setAdminTab] = useState('rbac'); // 'rbac' | 'audit'
  const [staffAccounts, setStaffAccounts] = useState(MOCK_STAFF_ACCOUNTS);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);

  // Shared Customer Cart (SCR-CUST-03)
  const [cartItems, setCartItems] = useState([]);

  // Tables State (SCR-WAIT-01)
  const [tables, setTables] = useState(MOCK_INITIAL_TABLES);

  // KDS Tickets (SCR-KDS-01)
  const [kdsTickets, setKdsTickets] = useState(MOCK_INITIAL_KDS_TICKETS);

  // 86 Items State (SCR-KDS-02)
  const [menuItems, setMenuItems] = useState(MOCK_MENU_ITEMS);

  // Active Diner Service Calls (Customer -> Waiter)
  const [serviceCalls, setServiceCalls] = useState([]);

  // Shared Transaction Metrics (Cashier -> Manager)
  const [dailyGrossSales, setDailyGrossSales] = useState(MOCK_MANAGER_METRICS.grossSales);
  const [dailyTablesServed, setDailyTablesServed] = useState(MOCK_MANAGER_METRICS.tablesServed);

  // Toast / System Event Simulation
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  // Service Call Actions (Customer -> Waiter)
  const addServiceCall = (tableId, text = 'Assistance Requested') => {
    const exists = serviceCalls.some((c) => c.tableId === tableId && c.status === 'Pending');
    if (exists) {
      showToast(`Service request for ${tableId} is already in the waiter's queue.`);
      return;
    }
    const newCall = {
      id: `SVC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tableId,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };
    setServiceCalls((prev) => [...prev, newCall]);
    showToast(`Ding! Service call registered for ${tableId}: "${text}"`);
  };

  const dismissServiceCall = (callId) => {
    setServiceCalls((prev) => prev.filter((c) => c.id !== callId));
    showToast('Waiter acknowledged and resolved service request.');
  };

  // Bill Request Action (Customer -> Cashier)
  const requestBill = (tableId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              billRequested: true,
              checkoutQueue: true,
              note: 'Bill Requested by Diner'
            }
          : t
      )
    );
    showToast(`Cashier desk received Pre-print Bill request for ${tableId}`);
  };

  // Settlement Recording (Cashier -> Manager & Admin Audit Trail)
  const recordSettlement = (amount, tableId, method = 'VietQR') => {
    setDailyGrossSales((prev) => prev + amount);
    setDailyTablesServed((prev) => prev + 1);

    // Append to Admin Audit Log (Task G)
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: 'CSH-MAI-01',
      actionCategory: 'BILL_SETTLED',
      clientIp: '192.168.1.50',
      details: `Settled bill for ${tableId} (${amount.toLocaleString()} VND via ${method})`
    };
    setAuditLogs((logs) => [newLog, ...logs]);
  };

  // Cart Actions
  const addToCart = (dish, modifierName = 'Default', addedBy = 'Guest-A (You)') => {
    if (dish.is86) {
      showToast(`Cannot add "${dish.name}": Item is 86'd out of stock`);
      return;
    }
    const newItem = {
      id: `CART-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      modifier: modifierName,
      addedBy
    };
    setCartItems((prev) => [...prev, newItem]);
    showToast(`WebSocket: Added "${dish.name}" to Table 05 shared cart`);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const submitCustomerOrder = () => {
    if (cartItems.length === 0) return;

    // Calculate actual order total from cart items (Task A)
    const orderTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Create a new KDS ticket
    const newTicketId = (100 + kdsTickets.length + 1).toString();
    const newTicket = {
      ticketId: newTicketId,
      tableId: 'T05',
      orderId: 'ORD-1048',
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      station: 'Station 3 (Hot Line)',
      items: cartItems.map((ci, idx) => ({
        id: `ITEM-${Date.now()}-${idx}`,
        dishId: ci.dishId,
        name: ci.name,
        quantity: ci.quantity,
        modifier: ci.modifier,
        status: 'Pending',
        station: ci.dishId === 'DISH-105' ? 'Station 4 (Bar)' : 'Station 3 (Hot Line)'
      }))
    };

    setKdsTickets((prev) => [...prev, newTicket]);

    // Update table T05 with accumulated bill amount (existing bill + new order total)
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== 'T05') return t;
        const newBill = (t.billAmount || 0) + orderTotal;
        return {
          ...t,
          status: 'Occupied',
          orderId: 'ORD-1048',
          billAmount: newBill,
          billRequested: false,
          checkoutQueue: false,
          note: `Active Dine-In (${newBill.toLocaleString()} VND)`
        };
      })
    );

    // Clear cart after placing order
    setCartItems([]);

    showToast(`New order placed for Table 05 (+${orderTotal.toLocaleString()} VND)! Added to active bill.`);
    setCustomerScreen('progress');
  };

  // KDS State Transitions (FR-006)
  const advanceTicketItemStatus = (ticketId, itemId, nextStatus) => {
    setKdsTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        return {
          ...ticket,
          items: ticket.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, status: nextStatus };
          })
        };
      })
    );

    if (nextStatus === 'Cooking') {
      showToast(`BOM inventory depleted for item. Ticket #${ticketId} is Cooking`);
    } else if (nextStatus === 'Ready') {
      showToast(`Push Alert & Vibration sent to Waiter for Ticket #${ticketId}`);
    }
  };

  const partialBumpItem = (ticketId, itemId) => {
    setKdsTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        const target = ticket.items.find((i) => i.id === itemId);
        if (!target || target.quantity <= 1) return ticket;

        const updatedItems = ticket.items.flatMap((item) => {
          if (item.id !== itemId) return [item];
          return [
            { ...item, quantity: item.quantity - 1, status: 'Cooking' },
            {
              ...item,
              id: `${item.id}-bumped`,
              quantity: 1,
              status: 'Ready'
            }
          ];
        });

        return { ...ticket, items: updatedItems };
      })
    );
    showToast('Partial Bump 1/2 complete. 1 Ready item sent to Waiter pass');
  };

  // 86 Out of stock toggle (SCR-KDS-02)
  const toggle86Item = (dishId) => {
    setMenuItems((prev) =>
      prev.map((dish) => {
        if (dish.id !== dishId) return dish;
        const new86 = !dish.is86;
        return {
          ...dish,
          is86: new86,
          disabledReason: new86 ? 'Disabled by Kitchen Staff' : null
        };
      })
    );
    showToast(`WebSocket: Menu 86 state toggled for ${dishId}`);
  };

  // Waiter Actions (SCR-WAIT-01, SCR-WAIT-03)
  const readyDishesList = useMemo(() => {
    const list = [];
    kdsTickets.forEach((ticket) => {
      ticket.items.forEach((item) => {
        if (item.status === 'Ready') {
          list.push({
            ticketId: ticket.ticketId,
            tableId: ticket.tableId,
            orderId: ticket.orderId,
            item
          });
        }
      });
    });
    return list;
  }, [kdsTickets]);

  const markItemServed = (ticketId, itemId) => {
    setKdsTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        return {
          ...ticket,
          items: ticket.items.map((item) => (item.id === itemId ? { ...item, status: 'Served' } : item))
        };
      })
    );
    showToast('Waiter marked dish as SERVED. Diner progress bar updated.');
  };

  const resetTableToAvailable = (tableId) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'Available',
              orderId: null,
              billAmount: null,
              billRequested: false,
              checkoutQueue: false,
              note: 'Sanitized & Ready'
            }
          : t
      )
    );
    // Dismiss any active service calls for this reset table
    setServiceCalls((prev) => prev.filter((c) => c.tableId !== tableId));
    showToast(`Table ${tableId} sanitized and reset to Available (Green)`);
  };

  // Manager BOM Actions (SCR-MGR-02)
  const updateBOMQuantity = (ingredientId, newQty) => {
    setRecipeBOM((prev) => {
      const updatedIngs = prev.ingredients.map((ing) => {
        if (ing.id !== ingredientId) return ing;
        const lineCost = Math.round(newQty * ing.unitCost);
        return { ...ing, quantity: newQty, lineCost };
      });
      return { ...prev, ingredients: updatedIngs };
    });
  };

  // Administrator Actions (SCR-ADM-01 & SCR-ADM-02)
  const toggleStaffStatus = (staffId) => {
    setStaffAccounts((prev) =>
      prev.map((staff) => {
        if (staff.id !== staffId) return staff;
        const isCurrentlyActive = staff.status === 'Active';
        const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'Active';
        const newTokenVersion = isCurrentlyActive ? staff.tokenVersion + 1 : staff.tokenVersion;

        // Auto-log to audit trail if suspended
        if (isCurrentlyActive) {
          const newLog = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            actorId: 'ADM-KHOA-01',
            actionCategory: 'USER_SUSPENDED',
            clientIp: '192.168.1.10',
            details: `Suspended Staff ID: ${staff.id} (${staff.name})`
          };
          setAuditLogs((logs) => [newLog, ...logs]);
          showToast(`Admin: Suspended ${staff.name}! Token version incremented to ${newTokenVersion} (sessions revoked).`);
        } else {
          showToast(`Admin: User ${staff.name} reactivated to Active.`);
        }

        return {
          ...staff,
          status: newStatus,
          tokenVersion: newTokenVersion
        };
      })
    );
  };

  // Reset entire state back to mock baseline
  const resetAllPrototypeData = () => {
    setTables(MOCK_INITIAL_TABLES);
    setKdsTickets(MOCK_INITIAL_KDS_TICKETS);
    setMenuItems(MOCK_MENU_ITEMS);
    setRecipeBOM(MOCK_RECIPE_BOM);
    setStaffAccounts(MOCK_STAFF_ACCOUNTS);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setCartItems([]);
    setServiceCalls([]);
    setDailyGrossSales(MOCK_MANAGER_METRICS.grossSales);
    setDailyTablesServed(MOCK_MANAGER_METRICS.tablesServed);
    setCustomerScreen('menu');
    setManagerTab('forecast');
    setAdminTab('rbac');
    showToast('Prototype state reset to baseline mock data.');
  };

  return (
    <MockStoreContext.Provider
      value={{
        activeRole,
        setActiveRole,
        customerScreen,
        setCustomerScreen,
        managerTab,
        setManagerTab,
        recipeBOM,
        updateBOMQuantity,
        adminTab,
        setAdminTab,
        staffAccounts,
        auditLogs,
        toggleStaffStatus,
        cartItems,
        addToCart,
        removeFromCart,
        submitCustomerOrder,
        tables,
        setTables,
        kdsTickets,
        advanceTicketItemStatus,
        partialBumpItem,
        menuItems,
        toggle86Item,
        readyDishesList,
        markItemServed,
        resetTableToAvailable,
        resetAllPrototypeData,
        toastMessage,
        showToast,
        serviceCalls,
        addServiceCall,
        dismissServiceCall,
        requestBill,
        dailyGrossSales,
        dailyTablesServed,
        recordSettlement
      }}
    >
      {children}
    </MockStoreContext.Provider>
  );
};

export const useMockStore = () => {
  const context = useContext(MockStoreContext);
  if (!context) {
    throw new Error('useMockStore must be used within MockStoreProvider');
  }
  return context;
};
