import type { Request, Response } from "express";
import { User } from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import config from '../config/config.js'; 
import type { UserCreationAttributes } from "../types/userInterface.js";