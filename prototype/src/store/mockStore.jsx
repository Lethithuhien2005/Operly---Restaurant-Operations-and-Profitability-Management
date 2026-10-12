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
  MOCK_MANAGER_METRICS,
  MOCK_INITIAL_RESERVATIONS
} from '../mock/data';

const MockStoreContext = createContext(null);

export const MockStoreProvider = ({ children }) => {
  // Navigation & Role Harness (Evaluator mechanism across all 6 roles)
  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'kitchen' | 'waiter' | 'cashier' | 'manager' | 'admin'
  const [customerScreen, setCustomerScreen] = useState('menu'); // 'menu' (SCR-CUST-03) | 'progress' (SCR-CUST-04) | 'reserve' (SCR-CUST-01) | 'profile'
  
  // Customer Reservations & Loyalty Member Profile
  const [reservations, setReservations] = useState(MOCK_INITIAL_RESERVATIONS);
  const [activeMember, setActiveMember] = useState(null); // null = Guest Mode, or member object

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

  // Enhanced Shared Table Cart Actions (SCR-CUST-03)
  const addToCart = (dish, modifierName = 'Default', addedBy = 'Guest-A (You)', quantity = 1, specialNotes = '') => {
    if (dish.is86) {
      showToast(`Cannot add "${dish.name}": Item is 86'd out of stock`);
      return;
    }
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.dishId === dish.id &&
          i.modifier === modifierName &&
          (i.specialNotes || '') === (specialNotes || '') &&
          i.addedBy === addedBy
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      }
      const newItem = {
        id: `CART-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity,
        modifier: modifierName,
        specialNotes,
        addedBy
      };
      return [...prev, newItem];
    });
    showToast(`WebSocket: Added ${quantity > 1 ? `${quantity}x ` : ''}"${dish.name}" to Table 05 shared cart`);
  };

  const updateCartItemQuantity = (cartItemId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== cartItemId) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from shared table cart');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Simulate Multi-Diner Live Cart Sync (Guest-B adding item over WebSocket)
  const simulateGuestBOrder = () => {
    const candidateDishes = menuItems.filter((d) => !d.is86 && d.id !== 'DISH-101');
    const dish = candidateDishes[Math.floor(Math.random() * candidateDishes.length)] || menuItems[0];
    addToCart(dish, 'Default', 'Guest-B', 1, '');
    showToast(`WebSocket: Guest-B added "${dish.name}" to the shared table cart.`);
  };

  // Loyalty & Member Mode Actions
  const loginMember = (phone) => {
    const member = MOCK_MEMBERS[phone];
    if (member) {
      setActiveMember(member);
      showToast(`Welcome back, ${member.name}! ${member.tier} Member discount applied.`);
      return true;
    } else {
      showToast(`Phone number "${phone}" not registered. Continuing in Guest Mode.`);
      return false;
    }
  };

  const logoutMember = () => {
    setActiveMember(null);
    showToast('Switched to Guest Mode (Anonymous Table Session).');
  };

  // Table Reservation Actions (SCR-CUST-01 & SCR-CUST-02)
  const createReservation = (newRes) => {
    const code = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = {
      ...newRes,
      id: `RSV-${Date.now()}`,
      code,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Confirmed'
    };
    setReservations((prev) => [created, ...prev]);

    // Append to system audit trail
    const audit = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: 'CUST-WEB-PORTAL',
      actionCategory: 'RESERVATION_CREATED',
      clientIp: '192.168.1.105',
      details: `Reservation ${code} confirmed for ${newRes.customerName} (${newRes.partySize} guests, Table ${newRes.tableId || 'TBD'})`
    };
    setAuditLogs((logs) => [audit, ...logs]);

    showToast(`Reservation ${code} confirmed! SMS confirmation sent to ${newRes.phone}.`);
    return created;
  };

  const cancelReservation = (resId) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: 'Cancelled' } : r))
    );
    showToast('Reservation has been cancelled.');
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

  // Bulk bump all items on a ticket to target status (Cooking or Ready)
  const bumpAllTicketItems = (ticketId, targetStatus = 'Ready') => {
    setKdsTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        return {
          ...ticket,
          items: ticket.items.map((item) => {
            if (item.status === 'Served' || item.status === 'Spoiled') return item;
            return { ...item, status: targetStatus };
          })
        };
      })
    );

    if (targetStatus === 'Ready') {
      showToast(`All items on Ticket #${ticketId} bumped to READY! Waiter alerted.`);
    } else {
      showToast(`All items on Ticket #${ticketId} bumped to ${targetStatus}.`);
    }
  };

  // Kitchen Spoilage Logger & Re-fire handler (SCR-KDS-03 & Journey 3 Step 7)
  const logSpoilage = (ticketId, itemId, reason, costImpact = 65000, notes = '', shouldRefire = true) => {
    let affectedItemName = '';
    setKdsTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        const target = ticket.items.find((i) => i.id === itemId);
        if (!target) return ticket;
        affectedItemName = target.name;

        if (shouldRefire) {
          return {
            ...ticket,
            items: ticket.items.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                status: 'Cooking',
                modifier: item.modifier && item.modifier !== 'Default'
                  ? `[RE-FIRE: ${reason}] ${item.modifier}`
                  : `[RE-FIRE: ${reason}]`
              };
            })
          };
        } else {
          return {
            ...ticket,
            items: ticket.items.map((item) => {
              if (item.id !== itemId) return item;
              return { ...item, status: 'Spoiled' };
            })
          };
        }
      })
    );

    // Append to system immutable Audit Log
    const newAudit = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: 'KCH-CHEF-01',
      actionCategory: 'KITCHEN_SPOILAGE',
      clientIp: '192.168.1.42',
      details: `Ticket #${ticketId} - ${affectedItemName || 'Dish'} | Reason: ${reason} | Waste loss: ${costImpact.toLocaleString()} VND | Refire: ${shouldRefire ? 'Yes' : 'No'} | Notes: ${notes || 'None'}`
    };
    setAuditLogs((logs) => [newAudit, ...logs]);

    showToast(
      `Spoilage logged: ${affectedItemName} (${reason}). Waste: ${costImpact.toLocaleString()} VND. ${
        shouldRefire ? 'Re-fire order placed on station.' : 'Item written off.'
      }`
    );
  };

  // Simulate new incoming ticket from dining room / QR ordering
  const addSimulatedTicket = () => {
    const tableChoices = ['T01', 'T04', 'T06', 'T02', 'T08'];
    const randomTable = tableChoices[Math.floor(Math.random() * tableChoices.length)];
    const newId = (100 + kdsTickets.length + 1).toString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sampleOrders = [
      {
        dishId: 'DISH-101',
        name: 'Seafood Spicy Hotpot',
        quantity: 1,
        modifier: 'Extra Spicy',
        station: 'Station 3 (Hot Line)'
      },
      {
        dishId: 'DISH-103',
        name: 'Grilled Wagyu Skewers (x4)',
        quantity: 2,
        modifier: 'Teriyaki Glaze',
        station: 'Station 2 (Grill)'
      },
      {
        dishId: 'DISH-105',
        name: 'Iced Herbal Tea',
        quantity: 2,
        modifier: 'Default',
        station: 'Station 4 (Bar)'
      },
      {
        dishId: 'DISH-106',
        name: 'Spring Rolls Platter',
        quantity: 1,
        modifier: 'Crispy Extra',
        station: 'Station 1 (Pantry)'
      }
    ];

    const randomItems = sampleOrders.slice(0, Math.floor(Math.random() * 2) + 1).map((s, idx) => ({
      id: `ITEM-${Date.now()}-${idx}`,
      dishId: s.dishId,
      name: s.name,
      quantity: s.quantity,
      modifier: s.modifier,
      status: 'Pending',
      station: s.station
    }));

    const newTicket = {
      ticketId: newId,
      tableId: randomTable,
      orderId: `ORD-${1050 + kdsTickets.length}`,
      placedAt: currentTime,
      elapsedMinutes: 0,
      priority: Math.random() > 0.6 ? 'VIP' : 'Dine-In',
      station: randomItems[0]?.station || 'Station 3 (Hot Line)',
      items: randomItems
    };

    setKdsTickets((prev) => [...prev, newTicket]);
    showToast(`🔔 Ticket #${newId} for Table ${randomTable} arrived at KDS!`);
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
    setReservations(MOCK_INITIAL_RESERVATIONS);
    setActiveMember(null);
    showToast('Prototype state reset to baseline mock data.');
  };

  return (
    <MockStoreContext.Provider
      value={{
        activeRole,
        setActiveRole,
        customerScreen,
        setCustomerScreen,
        reservations,
        activeMember,
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
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        simulateGuestBOrder,
        loginMember,
        logoutMember,
        createReservation,
        cancelReservation,
        submitCustomerOrder,
        tables,
        setTables,
        kdsTickets,
        advanceTicketItemStatus,
        partialBumpItem,
        bumpAllTicketItems,
        logSpoilage,
        addSimulatedTicket,
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
