import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create assignment (Admin assigns a user to a commodity)
router.post('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { commodityId, userId, deadline } = req.body;
    try {
        // Upsert: update if already assigned, else create
        const existing = await prisma.assignment.findFirst({ where: { commodityId } });
        let assignment;
        if (existing) {
            assignment = await prisma.assignment.update({
                where: { id: existing.id },
                data: { userId, deadline: deadline ? new Date(deadline) : undefined, status: 'ASSIGNED' }
            });
        } else {
            assignment = await prisma.assignment.create({
                data: { commodityId, userId, deadline: deadline ? new Date(deadline) : undefined, status: 'ASSIGNED' }
            });
        }

        // Update commodity status
        await prisma.commodity.update({ where: { id: commodityId }, data: { status: 'ASSIGNED' } });

        // Audit log
        await prisma.auditLog.create({
            data: { userId: req.user.userId, commodityId, assignmentId: assignment.id, action: 'ASSIGNED', details: `Assigned to userId: ${userId}` }
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update assignment (User updates sourcing details)
router.put('/:id', authenticateToken, async (req, res) => {
    const { status, userRemarks, updatedRate, updatedQuantity, sourceLocation } = req.body;
    try {
        const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
        if (!assignment) return res.status(404).json({ error: 'Not found' });
        if (req.user.role === 'USER' && assignment.userId !== req.user.userId) return res.sendStatus(403);

        const updated = await prisma.assignment.update({
            where: { id: req.params.id },
            data: { status, userRemarks, updatedRate, updatedQuantity, sourceLocation }
        });

        // If assignment is completed, mark commodity as completed too
        if (status === 'COMPLETED') {
            await prisma.commodity.update({ where: { id: assignment.commodityId }, data: { status: 'COMPLETED' } });
        }

        await prisma.auditLog.create({
            data: { userId: req.user.userId, commodityId: assignment.commodityId, assignmentId: assignment.id, action: 'STATUS_CHANGED', details: `Status: ${status}` }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all assignments (Admin) or my assignments (User)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const where = req.user.role === 'USER' ? { userId: req.user.userId } : {};
        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                commodity: true,
                user: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
