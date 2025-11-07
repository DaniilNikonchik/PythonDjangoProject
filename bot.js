const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Хранилище для заказов (в реальном проекте используйте базу данных)
const orders = new Map();
let orderCounter = 1;

// Команда старт
bot.start((ctx) => {
    ctx.reply(
        `🤖 <b>Бот для заказов "Дом Хвои"</b>\n\n` +
        `Я буду присылать уведомления о новых заказах с сайта.\n\n` +
        `Доступные команды:\n` +
        `/orders - просмотреть все заказы\n` +
        `/stats - статистика заказов\n` +
        `/help - помощь`,
        { parse_mode: 'HTML' }
    );
});

// Команда помощь
bot.help((ctx) => {
    ctx.reply(
        `📋 <b>Доступные команды:</b>\n\n` +
        `/orders - просмотреть все заказы\n` +
        `/order_[ID] - просмотреть конкретный заказ\n` +
        `/stats - статистика заказов\n` +
        `/contact - связаться с поддержкой\n\n` +
        `🛒 <b>Новые заказы</b> будут приходить автоматически с сайта.`,
        { parse_mode: 'HTML' }
    );
});

// Просмотр всех заказов
bot.command('orders', (ctx) => {
    if (orders.size === 0) {
        return ctx.reply('📭 Заказов пока нет');
    }

    let message = `📦 <b>Все заказы (${orders.size}):</b>\n\n`;
    
    orders.forEach((order, id) => {
        const status = order.status === 'completed' ? '✅' : 
                      order.status === 'cancelled' ? '❌' : '📝';
        message += `${status} <b>Заказ #${id}</b> - ${order.name} - ${order.total} руб.\n`;
    });

    message += `\nДля просмотра заказа используйте /order_[ID]`;

    ctx.reply(message, { parse_mode: 'HTML' });
});

// Просмотр конкретного заказа
bot.command(/order_(\d+)/, (ctx) => {
    const orderId = ctx.match[1];
    const order = orders.get(parseInt(orderId));

    if (!order) {
        return ctx.reply('❌ Заказ не найден');
    }

    const statusText = {
        'new': '📝 Новый',
        'completed': '✅ Выполнен',
        'cancelled': '❌ Отменен'
    };

    let message = `📋 <b>Заказ #${orderId}</b>\n\n`;
    message += `<b>Статус:</b> ${statusText[order.status]}\n`;
    message += `<b>Клиент:</b> ${order.name}\n`;
    message += `<b>Телефон:</b> ${order.phone}\n`;
    
    if (order.address) {
        message += `<b>Адрес:</b> ${order.address}\n`;
    }

    if (order.comment) {
        message += `<b>Комментарий:</b> ${order.comment}\n`;
    }
    
    message += `<b>Дата:</b> ${order.timestamp}\n\n`;
    message += `<b>Состав заказа:</b>\n`;

    order.cart.forEach(item => {
        message += `• ${item.name} - ${item.quantity} шт. × ${item.price} руб. = <b>${item.quantity * item.price} руб.</b>\n`;
    });

    message += `\n<b>💰 ИТОГО: ${order.total} руб.</b>`;

    // Кнопки в зависимости от статуса заказа
    let keyboard;
    
    if (order.status === 'new') {
        keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('✅ Выполнен', `complete_${orderId}`),
                Markup.button.callback('❌ Отменить', `cancel_${orderId}`)
            ],
            [
                Markup.button.callback('📞 Позвонить', `call_${order.phone.replace('+', '')}`)
            ]
        ]);
    } else if (order.status === 'completed') {
        keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('📞 Позвонить', `call_${order.phone.replace('+', '')}`)
            ]
        ]);
    } else if (order.status === 'cancelled') {
        keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('📞 Позвонить', `call_${order.phone.replace('+', '')}`)
            ]
        ]);
    }

    ctx.reply(message, { 
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
    });
});

// Статистика заказов
bot.command('stats', (ctx) => {
    const totalOrders = orders.size;
    const newOrders = Array.from(orders.values()).filter(o => o.status === 'new').length;
    const completedOrders = Array.from(orders.values()).filter(o => o.status === 'completed').length;
    const cancelledOrders = Array.from(orders.values()).filter(o => o.status === 'cancelled').length;
    const totalRevenue = Array.from(orders.values())
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);

    ctx.reply(
        `📊 <b>Статистика заказов</b>\n\n` +
        `📦 Всего заказов: <b>${totalOrders}</b>\n` +
        `📝 Новые: <b>${newOrders}</b>\n` +
        `✅ Выполненные: <b>${completedOrders}</b>\n` +
        `❌ Отмененные: <b>${cancelledOrders}</b>\n` +
        `💰 Общая выручка: <b>${totalRevenue} руб.</b>`,
        { parse_mode: 'HTML' }
    );
});

// Контакты
bot.command('contact', (ctx) => {
    ctx.reply(
        `📞 <b>Контакты "Дом Хвои"</b>\n\n` +
        `Телефон: +375291344343\n` +
        `Email: domkhvoi@gmail.com\n` +
        `Адрес: Минская область, Смолевичский район, г. Смолевичи, ул. Торговая, дом 18а, ком.4\n\n` +
        `Instagram: @dom_khvoi`,
        { parse_mode: 'HTML' }
    );
});

// Обработка callback кнопки "Выполнен"
bot.action(/complete_(\d+)/, (ctx) => {
    const orderId = parseInt(ctx.match[1]);
    const order = orders.get(orderId);
    
    if (order) {
        order.status = 'completed';
        
        // Обновляем сообщение
        const originalText = ctx.update.callback_query.message.text;
        const updatedText = originalText.replace('📝 Новый', '✅ Выполнен') + `\n\n✅ <b>Заказ выполнен!</b>`;
        
        ctx.editMessageText(updatedText, { 
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[
                Markup.button.callback('📞 Позвонить', `call_${order.phone.replace('+', '')}`)
            ]]}
        });
        
        ctx.answerCbQuery('Заказ отмечен как выполненный');
    }
});

// Обработка callback кнопки "Отменить"
bot.action(/cancel_(\d+)/, (ctx) => {
    const orderId = parseInt(ctx.match[1]);
    const order = orders.get(orderId);
    
    if (order) {
        order.status = 'cancelled';
        
        // Обновляем сообщение
        const originalText = ctx.update.callback_query.message.text;
        const updatedText = originalText.replace('📝 Новый', '❌ Отменен') + `\n\n❌ <b>Заказ отменен!</b>`;
        
        ctx.editMessageText(updatedText, { 
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[
                Markup.button.callback('📞 Позвонить', `call_${order.phone.replace('+', '')}`)
            ]]}
        });
        
        ctx.answerCbQuery('Заказ отменен');
    }
});

// Обработка кнопки "Позвонить"
bot.action(/call_(\d+)/, (ctx) => {
    const phone = ctx.match[1];
    ctx.answerCbQuery(`Телефон: +${phone}`);
});

// Функция для приема заказов с сайта
function handleNewOrder(orderData) {
    const orderId = orderCounter++;
    
    const order = {
        id: orderId,
        name: orderData.name,
        phone: orderData.phone,
        address: orderData.address || 'Не указан',
        comment: orderData.comment || '',
        cart: orderData.cart,
        total: orderData.total,
        status: 'new',
        timestamp: orderData.timestamp || new Date().toLocaleString('ru-RU')
    };
    
    orders.set(orderId, order);
    
    // Отправляем уведомление в Telegram
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    let message = `🛒 <b>НОВЫЙ ЗАКАЗ #${orderId}</b>\n\n`;
    message += `<b>👤 Клиент:</b> ${order.name}\n`;
    message += `<b>📞 Телефон:</b> ${order.phone}\n`;
    message += `<b>📍 Адрес:</b> ${order.address}\n`;
    
    if (order.comment) {
        message += `<b>💬 Комментарий:</b> ${order.comment}\n`;
    }
    
    message += `\n<b>📦 Состав заказа:</b>\n`;
    
    order.cart.forEach(item => {
        message += `• ${item.name} - ${item.quantity} шт. × ${item.price} руб. = <b>${item.quantity * item.price} руб.</b>\n`;
    });
    
    message += `\n<b>💰 ИТОГО: ${order.total} руб.</b>\n\n`;
    message += `<i>🕒 ${order.timestamp}</i>`;
    
    // Кнопки: "Выполнен", "Отменить" и "Позвонить"
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('✅ Выполнен', `complete_${orderId}`),
            Markup.button.callback('❌ Отменить', `cancel_${orderId}`)
        ],
        [
            Markup.button.callback('📞 Позвонить', `call_${order.phone.replace('+', '')}`)
        ]
    ]);
    
    bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: keyboard.reply_markup
    });
    
    return orderId;
}

// Запуск бота
bot.launch().then(() => {
    console.log('🤖 Telegram бот запущен');
}).catch(err => {
    console.error('Ошибка запуска бота:', err);
});

// Элегантное завершение работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, handleNewOrder };