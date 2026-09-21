import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  MOCK_MENU_ITEMS,
  MOCK_INITIAL_TABLES,
  MOCK_INITIAL_KDS_TICKETS,
  MOCK_MEMBERS,
  MOCK_COUPONS,
  MOCK_RECIPE_BOM,
  MOCK_STAFF_ACCOUNTS,
  MOCK_AUDIT_LOGS
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
  const [cartItems, setCartItems] = useState([
    {
      id: 'CART-1',
      dishId: 'DISH-101',
      name: 'Seafood Spicy Hotpot',
      price: 280000,
      quantity: 1,
      modifier: 'Less Spicy',
      addedBy: 'Guest-A (You)'
    },
    {
      id: 'CART-2',
      dishId: 'DISH-104',
      name: 'US Beef Slices',
      price: 80000,
      quantity: 1,
      modifier: 'Default',
      addedBy: 'Guest-B'
    },
    {
      id: 'CART-3',
      dishId: 'DISH-105',
      name: 'Iced Herbal Tea',
      price: 25000,
      quantity: 2,
      modifier: 'Less Sweet',
      addedBy: 'Guest-B'
    }
  ]);

  // Tables State (SCR-WAIT-01)
  const [tables, setTables] = useState(MOCK_INITIAL_TABLES);

  // KDS Tickets (SCR-KDS-01)
  const [kdsTickets, setKdsTickets] = useState(MOCK_INITIAL_KDS_TICKETS);

  // 86 Items State (SCR-KDS-02)
  const [menuItems, setMenuItems] = useState(MOCK_MENU_ITEMS);

  // Toast / System Event Simulation
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
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

    // Update table T05
    setTables((prev) =>
      prev.map((t) => (t.id === 'T05' ? { ...t, status: 'Occupied', note: 'Order #ORD-1048 In Prep' } : t))
    );

    showToast('Order #ORD-1048 submitted! Chime played on KDS');
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
      prev.map((t) => (t.id === tableId ? { ...t, status: 'Available', orderId: null, note: 'Sanitized & Ready' } : t))
    );
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
        showToast
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
