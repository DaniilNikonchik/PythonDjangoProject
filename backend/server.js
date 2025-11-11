const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { handleNewOrder } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Маршрут для обработки заказов
app.post('/api/order', async (req, res) => {
    try {
        const orderData = req.body;
        
        // Валидация данных
        if (!orderData.name || !orderData.phone || !orderData.cart || orderData.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Не все обязательные поля заполнены'
            });
        }

        // Отправляем заказ в бот
        const orderId = handleNewOrder(orderData);
        
        // Логируем заказ в консоль
        console.log('📦 Новый заказ:', {
            id: orderId,
            name: orderData.name,
            phone: orderData.phone,
            total: orderData.total,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Заказ успешно отправлен',
            orderId: orderId
        });
        
    } catch (error) {
        console.error('❌ Ошибка обработки заказа:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при отправке заказа'
        });
    }
});

// Статистика заказов (для админки)
app.get('/api/stats', (req, res) => {
    // Здесь можно добавить логику для получения статистики из базы данных
    res.json({
        totalOrders: 0,
        newOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
    });
});

// Статический маршрут для главной страницы
app.get('/', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🤖 Telegram бот готов к приему заказов`);
    console.log(`🌐 Сайт доступен по адресу: http://localhost:${PORT}`);
});