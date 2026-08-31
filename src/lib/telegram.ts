import type { Order } from '@/types';
import { useNotificationStore } from '@/store/notificationStore';

interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

/**
 * Отправить заявку с контактной формы в Telegram
 */
export async function sendContactFormToTelegram(data: ContactFormData): Promise<boolean> {
  try {
    const settings = useNotificationStore.getState().getSettings();
    const botToken = settings.telegramBotToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegramChatId || import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram credentials not configured. Skipping notification.');
      return false;
    }

    const messageText = `
📩 Новая заявка с сайта

👤 Имя: ${data.name}
📱 Телефон: ${data.phone}
${data.email ? `📧 Email: ${data.email}` : ''}
💬 Сообщение: ${data.message}

🕐 ${new Date().toLocaleString('ru-RU')}
`.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Telegram API error:', error);
      return false;
    }

    console.log('✅ Contact form sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error);
    return false;
  }
}

/**
 * Отправить заказ в Telegram
 */
export async function sendOrderToTelegram(order: Order): Promise<boolean> {
  try {
    const settings = useNotificationStore.getState().getSettings();
    const botToken = settings.telegramBotToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = settings.telegramChatId || import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram credentials not configured. Skipping notification.');
      return false;
    }

    // Форматирование товаров
    const itemsList = order.items
      .map((item) => `• ${item.productName} (${item.quantity}x) - ${item.price} сом`)
      .join('\n');

    // Методы доставки и оплаты
    const deliveryMethodLabel = order.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз';
    const paymentMethodLabel =
      order.paymentMethod === 'cash'
        ? 'Наличные'
        : order.paymentMethod === 'transfer'
          ? 'Переводом'
          : 'Онлайн оплата';

    const messageText = `
🛍️ Новый заказ #${order.orderNumber}

<b>Информация о клиенте:</b>
👤 Имя: ${order.customerName}
📱 Телефон: ${order.customerPhone}
${order.customerEmail ? `📧 Email: ${order.customerEmail}` : ''}

<b>Товары:</b>
${itemsList}

<b>Детали заказа:</b>
💰 Сумма: ${order.total} сом
📍 Способ доставки: ${deliveryMethodLabel}
${order.address ? `📍 Адрес: ${order.address}` : ''}
${order.district ? `🏘️ Район: ${order.district}` : ''}
💳 Способ оплаты: ${paymentMethodLabel}
${order.comment ? `💬 Комментарий: ${order.comment}` : ''}

🕐 ${new Date().toLocaleString('ru-RU')}
`.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Telegram API error:', error);
      return false;
    }

    console.log('✅ Order sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending to Telegram:', error);
    return false;
  }
}

/**
 * Проверить настройки Telegram (отправить тестовое сообщение)
 */
export async function testTelegramSettings(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!botToken || !chatId) {
      return {
        success: false,
        message: '❌ Не указаны токен бота или ID чата',
      };
    }

    const messageText = '✅ Тестовое сообщение из админ-панели ENTER.TJ';

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Telegram API error:', error);
      return {
        success: false,
        message: `❌ Ошибка: ${error.description || 'Неверные данные'}`,
      };
    }

    return {
      success: true,
      message: '✅ Тестовое сообщение отправлено успешно!',
    };
  } catch (error) {
    console.error('❌ Error testing Telegram settings:', error);
    return {
      success: false,
      message: '❌ Ошибка подключения к Telegram',
    };
  }
}
