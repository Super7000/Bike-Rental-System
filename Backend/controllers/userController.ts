import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from "../models/user";
import Booking from '../models/booking';
import { isAdmin } from './roleChecker';

export const getUser = async (req: Request, res: Response) => {
    try {
        const id = req.body.user.id;
        const user: IUser | null = await User.findById(id);
        if (user)
            user.password = "";
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const id = req.body.user.id;
        const { username, email, password } = req.body;
        const user: IUser | null = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        user.username = username;
        user.email = email;
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.body.user.id;
        const { password } = req.body;

        const user: IUser | null = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // chcek if user has bikes to return
        const bookings = await Booking.find({ userId: id, status: 'booked' });
        if (bookings.length > 0) {
            return res.status(400).json({ message: 'User has bikes to return' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Delete user's bookings
        await Booking.deleteMany({ userId: id });

        // Delete the user
        await User.findByIdAndDelete(id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}




// ADMIN CONTROLS




export const getAllUsers = async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const updateUserByAdmin = async (req: Request, res: Response) => {
    if (!isAdmin(req)) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const { id, username, email, password, role } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password && password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        if (email.trim() === '') {
            return res.status(400).json({ message: 'Fields cannot be empty' });
        }
        if (!nameRegex.test(username.trim())) {
            return res.status(400).json({ message: 'Invalid username format' });
        }

        const user: IUser | null = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (password != "") {
            const hashedPassword = await bcrypt.hash(password, 10)
            user.password = hashedPassword;
        }

        user.username = username;
        user.email = email;
        user.role = role;
        await user.save();
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const deleteUserByAdmin = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body

        const user: IUser | null = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // chcek if user has bikes to return
        const bookings = await Booking.find({ userId: userId, status: 'booked' });
        if (bookings.length > 0) {
            return res.status(400).json({ message: 'User has bikes to return' });
        }

        // Delete user's bookings
        await Booking.deleteMany({ userId: userId });

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}