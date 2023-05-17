import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { Server } from 'socket.io';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';

import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import profileRoutes from './routes/profile.js';
import battleRoutes from './routes/battlefield.js';
import priorityRoutes from './routes/priority.js';
import customerServiceRoutes from './routes/customerService.js';
import departmentRoutes from './routes/departments.js';
import userRoutes from './routes/users.js';
import calculatorRoutes from './routes/calculator.js';
import meetingRoutes from './routes/meeting.js';
import lostOrdersRoutes from './routes/lostOrders.js';
import staticticRoutes from './routes/statistic.js';
import purchasesRoutes from './routes/purchases.js';

import { transfers, agents } from './controllers/transfers.js';
import { battlefield } from './controllers/battlefield.js';
import { priority } from './controllers/priority.js';

connectDB();
const app = express();
const corsConfig = {
  credentials: true,
  origin: true
};
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors(corsConfig));
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use(errorHandler);
app.use('/dash', dashboardRoutes);
app.use('/battlefield', battleRoutes);
app.use('/priority', priorityRoutes);
app.use('/cust-service', customerServiceRoutes);

app.use('/meeting', meetingRoutes);
app.use('/lost', lostOrdersRoutes);
app.use('/statistics', staticticRoutes);
app.use('/calculator', calculatorRoutes);
app.use('/purchases', purchasesRoutes);

app.use('/users', userRoutes);
app.use('/departments', departmentRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://192.168.0.165:3000',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});
// transfer page socket connection
io.of('/transfers').on('connection', function (socket) {
  transfers(socket, io);
  agents(socket, io);
});
// battlefield page socket connection
io.of('/battlefield').on('connection', function (socket) {
  battlefield(socket, io);
});
// priority page socket connection
io.of('/priority').on('connection', function (socket) {
  priority(socket, io);
});

io.engine.on('connection_error', (err) => {
  console.log(err.message);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`PORT IS: ${PORT}`));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});
