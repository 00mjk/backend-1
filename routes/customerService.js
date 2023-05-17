import express from 'express';
import {
  getCustomerService,
  createCustomerService,
  updateCustomerService,
  deleteCustomerService
} from '../controllers/customerService.js';

const router = express.Router();

router.get('/', getCustomerService);
router.post('/', createCustomerService);
router.put('/:id', updateCustomerService);
router.delete('/:id', deleteCustomerService);

export default router;
