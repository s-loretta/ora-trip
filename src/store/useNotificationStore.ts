import { create } from 'zustand';

interface NotificationState {
  isOpen: boolean;
  message: string;
  showNotification: (message: string) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isOpen: false,
  message: '',
  
  showNotification: (message) => {
    set({ isOpen: true, message });
    
    // Auto-destruction élégante après 4 secondes
    setTimeout(() => {
      set({ isOpen: false });
    }, 4000);
  },
  
  hideNotification: () => set({ isOpen: false }),
}));