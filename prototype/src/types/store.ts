import { AppRoute } from '../utils/router';

export interface MockStoreHook {
  currentRoute: AppRoute;
  setCurrentRoute: (route: AppRoute) => void;
  navigate: (route: AppRoute) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
  toastMessage: string | null;
  showToast?: (message: string) => void;
  tables: Array<{ id: string; billRequested?: boolean; [key: string]: unknown }>;
  readyDishesList: unknown[];
  serviceCalls?: unknown[];
  resetAllPrototypeData: () => void;
}
