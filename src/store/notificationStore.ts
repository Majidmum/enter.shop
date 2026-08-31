import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotificationSettings {
  // Telegram
  telegramBotToken: string;
  telegramChatId: string;
  
  // Channels for orders
  ordersChannels: {
    telegram: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  
  // Channels for contact forms
  contactsChannels: {
    telegram: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  
  // WhatsApp
  whatsappNumber: string;
  
  // Email
  notificationEmail: string;
}

interface NotificationStore {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  getSettings: () => NotificationSettings;
}

const defaultSettings: NotificationSettings = {
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
  ordersChannels: {
    telegram: !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    whatsapp: false,
    email: false,
  },
  contactsChannels: {
    telegram: !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
    whatsapp: false,
    email: false,
  },
  whatsappNumber: '',
  notificationEmail: '',
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      getSettings: () => get().settings,
    }),
    {
      name: 'notification-settings',
    }
  )
);
