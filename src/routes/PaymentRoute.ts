// routes/paymentRoutes.ts
import express from 'express';
import upload from '../middleware/upload';
import { uploadReceipt, verifyPayment ,getPaymentSummary ,getPaymentHistoryByParentId } from '../controllers/PaymentController';

const router = express.Router();

router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);
router.patch('/verify/:paymentId', verifyPayment);
router.get('/summary', getPaymentSummary);
router.get('/history/:parentId', getPaymentHistoryByParentId);
export default router;
