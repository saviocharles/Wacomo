import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { parseMessage } from '../lib/parser.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET all commodities (Admin) with filters
router.get('/', authenticateToken, async (req, res) => {
    const { status, priority, location, commodity, userId, dateFrom, dateTo, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (location) where.location = { contains: location };
    if (commodity) where.parsedName = { contains: commodity };
    if (search) where.rawMessage = { contains: search };
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Users can only see their assigned commodities
    if (req.user.role === 'USER') {
        const assignments = await prisma.assignment.findMany({ where: { userId: req.user.userId } });
        where.id = { in: assignments.map(a => a.commodityId) };
    }

    try {
        const commodities = await prisma.commodity.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                assignments: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                }
            }
        });
        res.json(commodities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single commodity
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const commodity = await prisma.commodity.findUnique({
            where: { id: req.params.id },
            include: {
                assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
                auditLogs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
            }
        });
        if (!commodity) return res.status(404).json({ error: 'Not found' });
        res.json(commodity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update commodity (Admin: edit parsed data, priority, deadline, status)
router.put('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { parsedName, location, rate, quantity, unit, status, priority, deadline, remarks } = req.body;
    try {
        const commodity = await prisma.commodity.update({
            where: { id: req.params.id },
            data: {
                parsedName,
                location,
                rate,
                quantity,
                unit,
                status,
                priority,
                deadline: deadline ? new Date(deadline) : null,
                remarks
            }
        });
        await prisma.auditLog.create({
            data: { userId: req.user.userId, commodityId: commodity.id, action: 'EDITED', details: `Updated: ${JSON.stringify(req.body)}` }
        });
        res.json(commodity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET export CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const commodities = await prisma.commodity.findMany({
            orderBy: { createdAt: 'desc' },
            include: { assignments: { include: { user: { select: { name: true } } } } }
        });

        const header = ['ID', 'Commodity', 'Location', 'Rate', 'Quantity', 'Unit', 'Status', 'Priority', 'Deadline', 'Sender', 'Group', 'AssignedTo', 'AssignmentStatus', 'UserRemarks', 'UpdatedRate', 'UpdatedQty', 'Created'];
        const rows = commodities.map(c => {
            const asgn = c.assignments[0];
            return [
                c.id, c.parsedName || '', c.location || '', c.rate || '', c.quantity || '', c.unit || '',
                c.status, c.priority, c.deadline ? c.deadline.toISOString() : '',
                c.sender || '', c.groupName || '',
                asgn?.user?.name || '', asgn?.status || '', asgn?.userRemarks || '',
                asgn?.updatedRate || '', asgn?.updatedQuantity || '',
                c.createdAt.toISOString()
            ].join(',');
        });

        const csv = [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=commodities.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
