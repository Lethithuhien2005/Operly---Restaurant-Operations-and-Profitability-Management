import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { getInitialRoute, updateBrowserUrl } from '../utils/router';
import {
  authApi,
  menuApi,
  tablesApi,
  ordersApi,
  reservationsApi,
  kitchenApi,
  billingApi,
  tokenStorage,
} from '../api/client';
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
  MOCK_MANAGER_APPROVALS,
  MOCK_TEAM_DUTY_ROSTER,
  MOCK_INITIAL_RESERVATIONS,
  MOCK_CASHIER_SETTLED_HISTORY
} from '../mock/data';

const MockStoreContext = createContext(null);

export const MockStoreProvider = ({ children }) => {
  // Routing & Navigation State (Auth routes: /login, /signup, or / prototype)
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  const navigate = (route) => {
    setCurrentRoute(route);
    updateBrowserUrl(route);
  };

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentRoute(getInitialRoute());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Authentication & Role State (Always starts on Customer view unless authenticated as another role)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'kitchen' | 'waiter' | 'cashier' | 'manager' | 'admin'
  const [customerScreen, setCustomerScreen] = useState('menu'); // 'menu' (SCR-CUST-03) | 'progress' (SCR-CUST-04) | 'reserve' (SCR-CUST-01) | 'profile'
  const [categories, setCategories] = useState([]);
  const [activePromotions, setActivePromotions] = useState([]);
  
  // Customer Reservations & Loyalty Member Profile
  const [reservations, setReservations] = useState([]);
  const [activeMember, setActiveMember] = useState(null); // null = Guest Mode, or member object

  // Manager Operational & AI Views State
  const [managerTab, setManagerTab] = useState('dashboard');
  const [managerApprovals, setManagerApprovals] = useState([]);
  const [teamRoster, setTeamRoster] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isApprovalDrawerOpen, setIsApprovalDrawerOpen] = useState(false);
  const [recipeBOM, setRecipeBOM] = useState({ ingredients: [] });

  // Administrator Sub-Tabs (System Admin Only: Users, RBAC, Config, Audit)
  const [adminTab, setAdminTab] = useState('users');
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Shared Customer Cart (SCR-CUST-03)
  const [cartItems, setCartItems] = useState([]);

  // Tables State (SCR-WAIT-01)
  const [tables, setTables] = useState([]);

  // KDS Tickets (SCR-KDS-01)
  const [kdsTickets, setKdsTickets] = useState([]);

  // 86 Items State (SCR-KDS-02)
  const [menuItems, setMenuItems] = useState([]);

  // Active Diner Service Calls (Customer -> Waiter)
  const [serviceCalls, setServiceCalls] = useState([]);

  // Shared Transaction Metrics (Cashier -> Manager)
  const [dailyGrossSales, setDailyGrossSales] = useState(0);
  const [dailyTablesServed, setDailyTablesServed] = useState(0);

  // Cashier POS Specific States
  const [cashierSettledHistory, setCashierSettledHistory] = useState([]);
  const [cashierShiftSales, setCashierShiftSales] = useState(0);

  // Toast / System Event Simulation
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 4000);
  };

  // Load public catalog (categories, dishes, tables) from backend REST API
  const loadPublicMenu = useCallback(async () => {
    try {
      const [catRes, dishRes, tblRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getDishes(),
        tablesApi.getTables().catch(() => []),
      ]);
      const catList = Array.isArray(catRes) ? catRes : catRes?.items || catRes?.data || [];
      const dishList = Array.isArray(dishRes)
        ? dishRes
        : dishRes?.items || dishRes?.data?.items || dishRes?.data || [];
      const tblList = Array.isArray(tblRes) ? tblRes : tblRes?.items || tblRes?.data || [];
      setCategories(catList);
      setTables(
        tblList.map((t) => ({
          id: t.tableNumber || t.id,
          dbId: t.id,
          name: t.tableNumber,
          area: `Floor ${t.floor}`,
          floor: t.floor,
          capacity: t.capacity,
          status:
            t.status === 'AVAILABLE'
              ? 'Available'
              : t.status === 'OCCUPIED'
              ? 'Occupied'
              : t.status === 'RESERVED'
              ? 'Reserved'
              : 'Cleaning',
          guests: t.status === 'OCCUPIED' ? t.capacity : 0,
          billRequested: false,
        }))
      );
      setMenuItems(
        dishList.map((d) => ({
          id: d.id,
          name: d.name || '',
          category: d.category?.name || 'General',
          categoryId: d.categoryId || d.category?.id || '',
          price: Number(d.price || 0),
          costPrice: d.costPrice ? Number(d.costPrice) : Math.round(Number(d.price || 0) * 0.35),
          description: d.description || '',
          imageUrl: d.imageUrl || null,
          image: d.imageUrl || '🍽️',
          isAvailable: d.isAvailable !== false,
          is86: d.isAvailable === false,
          isRecommendable: Boolean(d.isRecommendable),
          prepTime: 15,
          rating: 4.8,
          tags: d.isRecommendable ? ['Chef Pick'] : [],
        }))
      );
    } catch (err) {
      console.warn('[Operly] Failed to load menu from backend:', err.message);
    }
  }, []);

  // Hydrate operational data for authenticated user
  const hydrateRoleData = useCallback(async (user) => {
    if (!user) return;
    const role = user.frontendRole || 'customer';
    try {
      if (['waiter', 'cashier', 'manager', 'admin'].includes(role)) {
        const tblRes = await tablesApi.getTables();
        const tblList = Array.isArray(tblRes) ? tblRes : tblRes?.data || [];
        if (tblList.length > 0) {
          setTables(
            tblList.map((t) => ({
              id: t.tableNumber || t.id,
              dbId: t.id,
              name: t.tableNumber,
              area: `Floor ${t.floor}`,
              floor: t.floor,
              capacity: t.capacity,
              status:
                t.status === 'AVAILABLE'
                  ? 'Available'
                  : t.status === 'OCCUPIED'
                  ? 'Occupied'
                  : t.status === 'RESERVED'
                  ? 'Reserved'
                  : 'Cleaning',
              guests: t.status === 'OCCUPIED' ? t.capacity : 0,
              billRequested: false,
            }))
          );
        }
      }

      if (['customer', 'waiter', 'manager', 'admin'].includes(role)) {
        const resData = await reservationsApi.getReservations();
        const resList = Array.isArray(resData) ? resData : resData?.data || [];
        setReservations(
          resList.map((r) => ({
            id: r.id,
            customerName: r.guestName,
            phone: r.guestPhone,
            partySize: r.partySize,
            date: new Date(r.reservationTime).toISOString().slice(0, 10),
            time: new Date(r.reservationTime).toTimeString().slice(0, 5),
            status: r.status,
            tableId: r.table?.tableNumber || r.tableId || 'Unassigned',
            specialRequest: r.specialRequest || '',
            depositAmount: Number(r.depositAmount || 0),
          }))
        );
      }

      if (['kitchen', 'waiter', 'manager', 'cashier'].includes(role)) {
        const queueRes = await kitchenApi.getQueue();
        const queueList = Array.isArray(queueRes) ? queueRes : queueRes?.data || [];
        setKdsTickets(
          queueList.map((ord, idx) => ({
            id: ord.orderCode || ord.id,
            ticketId: String(101 + idx),
            dbId: ord.id,
            sessionId: ord.sessionId,
            orderId: ord.orderCode || ord.id.slice(0, 8),
            tableId: ord.session?.table?.tableNumber || 'T05',
            area: ord.session?.table ? `Floor ${ord.session.table.floor}` : 'Main Hall',
            placedAt: new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            elapsedMinutes: Math.max(1, Math.floor((Date.now() - new Date(ord.createdAt).getTime()) / 60000)),
            station: 'Station 3 (Hot Line)',
            items: (ord.orderItems || []).map((oi) => ({
              id: oi.id,
              dishId: oi.menuItemId,
              menuId: oi.menuItemId,
              name: oi.menuItem?.name || 'Dish',
              quantity: oi.quantity,
              qty: oi.quantity,
              modifier: oi.notes || 'Default',
              notes: oi.notes || '',
              station: 'Station 3 (Hot Line)',
              status:
                oi.itemStatus === 'PENDING'
                  ? 'Pending'
                  : oi.itemStatus === 'COOKING'
                  ? 'Cooking'
                  : oi.itemStatus === 'READY'
                  ? 'Ready'
                  : 'Served',
            })),
          }))
        );
      }

      if (['cashier', 'waiter', 'manager'].includes(role)) {
        const promoRes = await billingApi.getActivePromotions().catch(() => []);
        setActivePromotions(Array.isArray(promoRes) ? promoRes : promoRes?.data || []);
      }

      if (['cashier', 'manager'].includes(role)) {
        const billRes = await billingApi.getBills();
        const billList = Array.isArray(billRes) ? billRes : billRes?.data || [];
        const paidBills = billList.filter((b) => b.status === 'PAID');
        setCashierSettledHistory(
          paidBills.map((b) => ({
            invoiceId: b.billCode,
            orderId: b.session?.sessionCode || b.sessionId,
            tableName: b.session?.table?.tableNumber || 'Table',
            area: b.session?.table ? `Floor ${b.session.table.floor}` : 'Main Hall',
            settledAt: new Date(b.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            cashierName: b.cashier?.fullName || 'Cashier',
            subtotal: Number(b.subtotalAmount),
            discountAmount: Number(b.discountAmount),
            finalTotal: Number(b.finalAmount),
            paymentMethod: b.payments?.[0]?.paymentMethod || 'CASH',
          }))
        );
      }
    } catch (err) {
      console.warn('[Operly] Hydration warning:', err.message);
    }
  }, []);

  // Boot effect: load public menu & restore auth session if token exists
  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadPublicMenu();
      const token = tokenStorage.getAccess();
      if (token) {
        try {
          const me = await authApi.getMe();
          if (mounted && me) {
            setCurrentUser(me);
            setActiveRole(me.frontendRole || 'customer');
            if (me.frontendRole === 'customer') {
              setActiveMember({
                id: me.id,
                name: me.fullName,
                phone: me.phone,
                tier: 'GOLD',
                tierDiscountPct: 10,
                points: 1250,
              });
            }
            await hydrateRoleData(me);
          }
        } catch {
          tokenStorage.clear();
          if (mounted) {
            setCurrentUser(null);
            setActiveRole('customer');
          }
        }
      }
      if (mounted) setIsAuthLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadPublicMenu, hydrateRoleData]);

  const requireAuth = (actionLabel = 'perform this action') => {
    if (!currentUser) {
      showToast(`Please sign in to ${actionLabel}.`);
      navigate('login');
      return false;
    }
    return true;
  };

  const loginUser = async (identifier, password) => {
    const data = await authApi.login(identifier, password);
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    setCurrentUser(data.user);
    const targetRole = data.user.frontendRole || 'customer';
    setActiveRole(targetRole);
    if (targetRole === 'customer') {
      setActiveMember({
        id: data.user.id,
        name: data.user.fullName,
        phone: data.user.phone,
        tier: 'GOLD',
        tierDiscountPct: 10,
        points: 1250,
      });
    } else {
      setActiveMember(null);
    }
    await hydrateRoleData(data.user);
    navigate('prototype');
    showToast(`Signed in as ${data.user.fullName} (${data.user.role})`);
    return data;
  };

  const registerUser = async (payload) => {
    const data = await authApi.register(payload);
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    setCurrentUser(data.user);
    setActiveRole(data.user.frontendRole || 'customer');
    setActiveMember({
      id: data.user.id,
      name: data.user.fullName,
      phone: data.user.phone,
      tier: 'SILVER',
      tierDiscountPct: 5,
      points: 100,
    });
    await hydrateRoleData(data.user);
    navigate('prototype');
    showToast(`Welcome ${data.user.fullName}! Account created.`);
    return data;
  };

  const logoutUser = async () => {
    try {
      if (tokenStorage.getAccess()) {
        await authApi.logout();
      }
    } catch {
      // ignore network error on logout
    }
    tokenStorage.clear();
    setCurrentUser(null);
    setActiveMember(null);
    setActiveRole('customer');
    setCustomerScreen('menu');
    navigate('prototype');
    showToast('Logged out. Returned to Customer view.');
  };

  // Service Call Actions (Customer -> Waiter)
  const addServiceCall = (tableId, text = 'Assistance Requested') => {
    if (!requireAuth('call a waiter')) return;
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
    if (!requireAuth('request the bill')) return;
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

  // Request escalation from Cashier to Manager Queue (Void Dish, Discount Override)
  const requestCashierApproval = ({ type, category, urgency = 'High', title, table, amount, reason, details }) => {
    const newId = `APP-${Math.floor(110 + Math.random() * 880)}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newApproval = {
      id: newId,
      type: type || 'Void Dish',
      category: category || (type === 'Void Dish' ? 'Billing' : 'Policy'),
      urgency: urgency || 'High',
      title: title || `${type} for ${table || 'Table'}`,
      requester: 'Mai Le',
      requesterRole: 'Cashier',
      timestamp: currentTime,
      table: table || 'Table 08',
      amount: amount || 0,
      reason: reason || 'Cashier requested managerial override',
      status: 'Pending',
      details: details || `POS Terminal escalation dispatched at ${currentTime}. Awaiting Manager authorization.`
    };
    setManagerApprovals((prev) => [newApproval, ...prev]);
    showToast(`⚡ Dispatched ${type} request (${newId}) to Manager Approvals Queue!`);
    return newApproval;
  };

  // Settle Cashier Invoice with full accounting & audit trail
  const settleCashierInvoice = async ({
    tableId,
    tableName,
    orderId,
    subtotal,
    discountAmount = 0,
    discountDetail = 'None',
    finalTotal,
    paymentMethod = 'VietQR',
    itemsCount = 1,
    paymentRef
  }) => {
    const targetTable = tables.find((t) => t.id === tableId);
    const matchingTicket = kdsTickets.find((kt) => kt.tableId === tableId && kt.sessionId);
    let backendBillCode = null;

    if (matchingTicket?.sessionId) {
      try {
        const bill = await billingApi.createBill({ sessionId: matchingTicket.sessionId });
        backendBillCode = bill.billCode;
        const mappedMethod =
          paymentMethod === 'Cash'
            ? 'CASH'
            : paymentMethod === 'MoMo'
            ? 'MOMO'
            : paymentMethod === 'VNPay'
            ? 'VNPAY'
            : 'BANK_TRANSFER';
        await billingApi.processPayment(bill.id, {
          paymentMethod: mappedMethod,
          amountPaid: Number(bill.finalAmount || finalTotal),
          transactionCode: paymentRef || undefined,
        });
      } catch (err) {
        console.warn('[Operly] Backend bill settlement warning:', err.message);
      }
    }

    if (targetTable?.dbId) {
      tablesApi.updateTableStatus(targetTable.dbId, 'CLEANING').catch(() => {});
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newInvoice = {
      invoiceId: backendBillCode || `INV-${dateStr}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: orderId || `ORD-${Math.floor(1050 + Math.random() * 50)}`,
      tableName: tableName || `Table ${tableId}`,
      area: targetTable?.area || 'Main Hall',
      settledAt: timeStr,
      cashierName: currentUser?.fullName || 'Cashier',
      subtotal,
      discountAmount,
      discountDetail,
      finalTotal,
      paymentMethod,
      itemsCount,
      paymentRef: paymentRef || `${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setCashierSettledHistory((prev) => [newInvoice, ...prev]);
    setCashierShiftSales((prev) => prev + finalTotal);
    recordSettlement(finalTotal, tableName || tableId, paymentMethod);

    // Transition table to Cleaning
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'Cleaning',
              billAmount: null,
              billRequested: false,
              checkoutQueue: false,
              note: 'Settled (Needs sanitize & busing)'
            }
          : t
      )
    );

    showToast(`✓ Invoice #${newInvoice.invoiceId} for ${newInvoice.tableName} settled via ${paymentMethod}!`);
    return newInvoice;
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
  const createReservation = async (newRes) => {
    if (!requireAuth('book a table reservation')) return null;

    const isoTime = new Date(`${newRes.date || new Date().toISOString().slice(0, 10)}T${newRes.time || '19:00'}:00`).toISOString();
    try {
      const createdApi = await reservationsApi.createReservation({
        customerId: currentUser.id,
        guestName: newRes.customerName || currentUser.fullName,
        guestPhone: newRes.phone || currentUser.phone,
        partySize: Number(newRes.partySize || 2),
        reservationTime: isoTime,
        specialRequest: newRes.specialRequest || undefined,
      });
      const created = {
        id: createdApi.id,
        code: createdApi.id.slice(0, 8).toUpperCase(),
        customerName: createdApi.guestName,
        phone: createdApi.guestPhone,
        partySize: createdApi.partySize,
        date: new Date(createdApi.reservationTime).toISOString().slice(0, 10),
        time: new Date(createdApi.reservationTime).toTimeString().slice(0, 5),
        status: createdApi.status,
        tableId: createdApi.table?.tableNumber || 'TBD',
        specialRequest: createdApi.specialRequest || '',
      };
      setReservations((prev) => [created, ...prev]);
      showToast(`Reservation confirmed for ${created.customerName} (${created.partySize} guests)!`);
      return created;
    } catch (err) {
      showToast(`Reservation failed: ${err.message}`);
      return null;
    }
  };

  const cancelReservation = async (resId) => {
    if (!requireAuth('cancel a reservation')) return;
    try {
      await reservationsApi.cancelReservation(resId, 'Cancelled by user');
      setReservations((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, status: 'CANCELLED' } : r))
      );
      showToast('Reservation has been cancelled.');
    } catch (err) {
      showToast(`Failed to cancel reservation: ${err.message}`);
    }
  };

  const submitCustomerOrder = async () => {
    if (!requireAuth('submit an order to the kitchen')) return;
    if (cartItems.length === 0) return;

    const orderTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const targetTable = tables.find((t) => t.id === 'T05' || t.name === 'T05') || tables[0];

    let createdOrder = null;
    if (targetTable?.dbId) {
      try {
        createdOrder = await ordersApi.createOrder({
          tableId: targetTable.dbId,
          items: cartItems.map((ci) => ({
            menuItemId: ci.dishId,
            quantity: ci.quantity,
            notes: [ci.modifier, ci.specialNotes].filter((x) => x && x !== 'Default').join(' | ') || undefined,
          })),
        });
      } catch (err) {
        showToast(`Order submission failed: ${err.message}`);
        return;
      }
    }

    const newTicketId = (100 + kdsTickets.length + 1).toString();
    const newTicket = {
      ticketId: newTicketId,
      dbId: createdOrder?.id,
      sessionId: createdOrder?.sessionId,
      tableId: targetTable?.id || 'T05',
      orderId: createdOrder?.orderCode || `ORD-${Date.now().toString().slice(-4)}`,
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      station: 'Station 3 (Hot Line)',
      items: (createdOrder?.orderItems || cartItems).map((ci, idx) => ({
        id: ci.id || `ITEM-${Date.now()}-${idx}`,
        dishId: ci.menuItemId || ci.dishId,
        name: ci.menuItem?.name || ci.name,
        quantity: ci.quantity,
        modifier: ci.notes || ci.modifier || 'Default',
        status: 'Pending',
        station: 'Station 3 (Hot Line)'
      }))
    };

    setKdsTickets((prev) => [...prev, newTicket]);

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== (targetTable?.id || 'T05')) return t;
        const newBill = (t.billAmount || 0) + orderTotal;
        return {
          ...t,
          status: 'Occupied',
          orderId: newTicket.orderId,
          billAmount: newBill,
          billRequested: false,
          checkoutQueue: false,
          note: `Active Dine-In (${newBill.toLocaleString()} VND)`
        };
      })
    );

    setCartItems([]);
    showToast(`Order #${newTicket.orderId} sent to kitchen (+${orderTotal.toLocaleString()} VND)!`);
    setCustomerScreen('progress');
  };

  // KDS State Transitions (FR-006)
  const advanceTicketItemStatus = async (ticketId, itemId, nextStatus) => {
    const backendStatus =
      nextStatus === 'Cooking'
        ? 'COOKING'
        : nextStatus === 'Ready'
        ? 'READY'
        : nextStatus === 'Served'
        ? 'SERVED'
        : 'PENDING';

    if (itemId && !String(itemId).startsWith('ITEM-') && !String(itemId).includes('-bumped')) {
      try {
        await kitchenApi.updateItemStatus(itemId, backendStatus);
      } catch (err) {
        showToast(`KDS update failed: ${err.message}`);
        return;
      }
    }

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
      showToast(`Push Alert sent to Waiter for Ticket #${ticketId}`);
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
  const toggle86Item = async (dishId) => {
    const target = menuItems.find((d) => d.id === dishId);
    const nextIs86 = target ? !target.is86 : true;
    try {
      await menuApi.toggleAvailability(dishId, !nextIs86);
    } catch (err) {
      showToast(`Failed to toggle 86 status: ${err.message}`);
      return;
    }

    setMenuItems((prev) =>
      prev.map((dish) => {
        if (dish.id !== dishId) return dish;
        const new86 = !dish.is86;
        return {
          ...dish,
          isAvailable: !new86,
          is86: new86,
          disabledReason: new86 ? 'Disabled by Kitchen Staff' : null
        };
      })
    );
    showToast(`Menu 86 state toggled for ${target?.name || dishId}`);
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

  const markItemServed = async (ticketId, itemId) => {
    if (itemId && !String(itemId).startsWith('ITEM-') && !String(itemId).includes('-bumped')) {
      try {
        await kitchenApi.updateItemStatus(itemId, 'SERVED');
      } catch (err) {
        showToast(`Failed to mark served: ${err.message}`);
        return;
      }
    }
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

  const resetTableToAvailable = async (tableId) => {
    const target = tables.find((t) => t.id === tableId);
    if (target?.dbId) {
      try {
        await tablesApi.updateTableStatus(target.dbId, 'AVAILABLE');
      } catch (err) {
        showToast(`Table reset failed: ${err.message}`);
        return;
      }
    }
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
    setServiceCalls((prev) => prev.filter((c) => c.tableId !== tableId));
    showToast(`Table ${tableId} sanitized and reset to Available`);
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

  // Manager Approval Actions (Optimistic UI + Toast Feedback)
  const approveRequest = (id, notes = '') => {
    const target = managerApprovals.find((a) => a.id === id);
    if (!target) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const decisionNotes = notes.trim() || 'Approved by Duty Manager';

    setManagerApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Approved',
              processedAt: nowTime,
              processedBy: 'Nam Hoang (Manager)',
              notes: decisionNotes
            }
          : item
      )
    );

    setSelectedApproval((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: 'Approved',
            processedAt: nowTime,
            processedBy: 'Nam Hoang (Manager)',
            notes: decisionNotes
          }
        : prev
    );

    // Append to immutable audit trail (SCR-ADM-02)
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: 'MGR-NAM-01',
      actionCategory: 'MANAGER_APPROVAL',
      clientIp: '192.168.1.15',
      details: `Approved ${target.type} (${target.title}) | Urgency: ${target.urgency} | Notes: ${decisionNotes}`
    };
    setAuditLogs((logs) => [newLog, ...logs]);

    showToast(`✓ Request ${target.type} (${target.id}) approved successfully!`);
  };

  const rejectRequest = (id, notes = '') => {
    const target = managerApprovals.find((a) => a.id === id);
    if (!target) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const decisionNotes = notes.trim() || 'Rejected by Duty Manager (Policy Violation)';

    setManagerApprovals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Rejected',
              processedAt: nowTime,
              processedBy: 'Nam Hoang (Manager)',
              notes: decisionNotes
            }
          : item
      )
    );

    setSelectedApproval((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status: 'Rejected',
            processedAt: nowTime,
            processedBy: 'Nam Hoang (Manager)',
            notes: decisionNotes
          }
        : prev
    );

    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorId: 'MGR-NAM-01',
      actionCategory: 'MANAGER_REJECTION',
      clientIp: '192.168.1.15',
      details: `Rejected ${target.type} (${target.title}) | Notes: ${decisionNotes}`
    };
    setAuditLogs((logs) => [newLog, ...logs]);

    showToast(`✕ Request ${target.type} (${target.id}) rejected.`);
  };

  const openApprovalDrawer = (approval) => {
    setSelectedApproval(approval);
    setIsApprovalDrawerOpen(true);
  };

  const closeApprovalDrawer = () => {
    setIsApprovalDrawerOpen(false);
    setSelectedApproval(null);
  };

  // Manager Duty Roster Actions
  const updateStaffShiftStatus = (staffId, newStatus) => {
    setTeamRoster((prev) =>
      prev.map((stf) => (stf.id === staffId ? { ...stf, status: newStatus } : stf))
    );
    showToast(`Staff ${staffId} status updated to: ${newStatus}`);
  };

  // Simulate incoming urgent approval request
  const addSimulatedUrgentApproval = () => {
    const newId = `APP-${Math.floor(105 + Math.random() * 90)}`;
    const samples = [
      {
        type: 'Void Dish',
        category: 'Billing',
        urgency: 'High',
        title: 'Void Dish: Vegan Mushroom Hotpot (Table T07)',
        requester: 'Van B',
        requesterRole: 'Waiter',
        table: 'Table 07',
        amount: 220000,
        reason: 'Guest changed selection to Seafood Hotpot before cooking began',
        details: 'Order #ORD-1049. Kitchen confirmed preparation not started; zero food waste incurred.'
      },
      {
        type: 'Discount Override',
        category: 'Policy',
        urgency: 'Critical',
        title: 'VIP Birthday Voucher 45% Override (Table T02)',
        requester: 'Mai Le',
        requesterRole: 'Cashier',
        table: 'Table 02',
        amount: 540000,
        reason: 'VIP Diamond member birthday month voucher attached',
        details: 'Exceeds standard 40% discount cap (PRD Rule 7). Requires Manager passcode override to release POS settlement.'
      },
      {
        type: 'Urgent Procurement',
        category: 'Inventory',
        urgency: 'Critical',
        title: 'Urgent Requisition: 10 Bottles Red Wine Cabernet',
        requester: 'Thao Vy Pham',
        requesterRole: 'Bartender',
        supplier: 'Wine Import VN',
        amount: 3200000,
        reason: 'Bar stock depleted due to 2 unexpected walk-in banquet tables',
        details: 'Supplier dispatch ready within 30 minutes upon purchase authorization.'
      }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    const newReq = {
      ...pick,
      id: newId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };

    setManagerApprovals((prev) => [newReq, ...prev]);
    showToast(`⚡ Manager Alert: Incoming urgent ${pick.type} request (${newId})!`);
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
    setManagerTab('overview');
    setManagerApprovals(MOCK_MANAGER_APPROVALS);
    setTeamRoster(MOCK_TEAM_DUTY_ROSTER);
    setSelectedApproval(null);
    setIsApprovalDrawerOpen(false);
    setAdminTab('fi-dashboard');
    setReservations(MOCK_INITIAL_RESERVATIONS);
    setActiveMember(null);
    setCashierSettledHistory(MOCK_CASHIER_SETTLED_HISTORY);
    setCashierShiftSales(18450000);
    showToast('Prototype state reset to baseline mock data.');
  };

  return (
    <MockStoreContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        loginUser,
        registerUser,
        logoutUser,
        requireAuth,
        categories,
        activePromotions,
        loadPublicMenu,
        hydrateRoleData,
        activeRole,
        setActiveRole,
        customerScreen,
        setCustomerScreen,
        reservations,
        activeMember,
        managerTab,
        setManagerTab,
        managerApprovals,
        teamRoster,
        selectedApproval,
        isApprovalDrawerOpen,
        approveRequest,
        rejectRequest,
        openApprovalDrawer,
        closeApprovalDrawer,
        updateStaffShiftStatus,
        addSimulatedUrgentApproval,
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
        recordSettlement,
        cashierSettledHistory,
        setCashierSettledHistory,
        cashierShiftSales,
        setCashierShiftSales,
        requestCashierApproval,
        settleCashierInvoice,
        currentRoute,
        setCurrentRoute,
        navigate
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
