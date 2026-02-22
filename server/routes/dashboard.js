import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const now = new Date();
        const [total, pending, assigned, completed, unidentified, high, overdue, users] = await Promise.all([
            prisma.commodity.count(),
            prisma.commodity.count({ where: { status: 'PENDING' } }),
            prisma.commodity.count({ where: { status: 'ASSIGNED' } }),
            prisma.commodity.count({ where: { status: 'COMPLETED' } }),
            prisma.commodity.count({ where: { status: 'UNIDENTIFIED' } }),
            prisma.commodity.count({ where: { priority: 'HIGH' } }),
            prisma.commodity.count({ where: { deadline: { lt: now }, status: { not: 'COMPLETED' } } }),
            prisma.user.count({ where: { role: 'USER' } }),
        ]);

        // Commodity-wise summary (top commodities)
        const allCommodities = await prisma.commodity.findMany({ select: { parsedName: true, quantity: true, rate: true } });
        const commoditySummary = allCommodities.reduce((acc, c) => {
            const name = c.parsedName || 'Unidentified';
            if (!acc[name]) acc[name] = { count: 0, totalQty: 0 };
            acc[name].count++;
            acc[name].totalQty += c.quantity || 0;
            return acc;
        }, {});

        // Location-wise summary
        const locationSummary = allCommodities.reduce((acc, c) => {
            // Not storing location with commodity directly using Location model, using the string field
            return acc;
        }, {});

        res.json({ total, pending, assigned, completed, unidentified, high, overdue, users, commoditySummary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
