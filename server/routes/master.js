import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// ── LOCATIONS ──────────────────────────────────────────────
router.get('/locations', authenticateToken, async (req, res) => {
    res.json(await prisma.location.findMany({ orderBy: { name: 'asc' } }));
});
router.post('/locations', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { name, state } = req.body;
    const loc = await prisma.location.create({ data: { name, state } });
    res.status(201).json(loc);
});
router.delete('/locations/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    await prisma.location.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
});

// ── COMMODITY MASTER ────────────────────────────────────────
router.get('/commodity-master', authenticateToken, async (req, res) => {
    res.json(await prisma.commodityMaster.findMany({ orderBy: { name: 'asc' } }));
});
router.post('/commodity-master', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { name, unit } = req.body;
    const cm = await prisma.commodityMaster.create({ data: { name, unit } });
    res.status(201).json(cm);
});
router.delete('/commodity-master/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    await prisma.commodityMaster.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
});

// ── WHATSAPP GROUPS ─────────────────────────────────────────
router.get('/groups', authenticateToken, async (req, res) => {
    res.json(await prisma.whatsAppGroup.findMany({ orderBy: { name: 'asc' } }));
});
router.post('/groups', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { name, groupId } = req.body;
    const g = await prisma.whatsAppGroup.create({ data: { name, groupId } });
    res.status(201).json(g);
});
router.put('/groups/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { name, groupId, active } = req.body;
    const g = await prisma.whatsAppGroup.update({ where: { id: req.params.id }, data: { name, groupId, active } });
    res.json(g);
});
router.delete('/groups/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    await prisma.whatsAppGroup.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
});

// ── USERS (User Master) ─────────────────────────────────────
router.get('/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true } });
    res.json(users);
});
router.put('/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { name, role, phone } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { name, role, phone } });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone });
});
router.put('/users/:id/reset-password', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { newPassword } = req.body;
    const bcrypt = await import('bcryptjs').then(m => m.default);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashedPassword } });
    res.json({ message: 'Password reset successful' });
});

export default router;
