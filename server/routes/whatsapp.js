import express from 'express';
import { PrismaClient } from '@prisma/client';
import { parseMessage } from '../lib/parser.js';

const router = express.Router();
const prisma = new PrismaClient();

// Simulate or receive WhatsApp message
router.post('/', async (req, res) => {
    const { message, sender, groupName, messageId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message content required' });

    try {
        const parsedData = parseMessage(message);
        const commodity = await prisma.commodity.create({
            data: {
                rawMessage: message,
                messageId: messageId || `sim_${Date.now()}`,
                sender: sender || 'Simulator',
                groupName: groupName || 'Simulator Group',
                parsedName: parsedData.commodity || 'Unidentified',
                location: parsedData.location,
                rate: parsedData.rate,
                quantity: parsedData.quantity,
                unit: parsedData.unit,
                priority: 'MEDIUM',
                status: parsedData.isParsed ? 'PENDING' : 'UNIDENTIFIED',
            }
        });

        await prisma.auditLog.create({
            data: { commodityId: commodity.id, action: 'CREATED', details: `Message from ${sender || 'Simulator'}` }
        });

        res.status(201).json({ success: true, data: commodity, parsed: parsedData });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
