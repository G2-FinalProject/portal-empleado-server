import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import roleRouter from './routes/roleRoutes.js';
import vacationRequestRoutes from "./routes/vacationRequestRoutes.js";
import userRouter from "./routes/userRoutes.js"
import authRouter from './routes/authRoutes.js';
import departmentRouter from './routes/departmentRoutes.js';
import locationRouter from './routes/locationRoutes.js';
import HolidayRouter from './routes/holidayRoutes.js';
import vacationApprovalRoutes from './routes/vacationApprovalRoutes.js';
import config from './config/config.js';


const app = express();


app.use(cors({ origin: config.cors.corsOrigin })); 
app.use(express.json());

app.use("/users", userRouter); 
app.use("/auth", authRouter);
app.use("/departments", departmentRouter);
app.use("/locations", locationRouter);
app.use("/vacations", vacationRequestRoutes);
app.use("/roles", roleRouter);
app.use("/holidays", HolidayRouter);
app.use("/vacations", vacationApprovalRoutes);


app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/', (_req, res) => res.send('Servidor funcionando 🚀'));

export default app;