import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from "../models/user";
import Booking from '../models/booking';

export const getUser = async (req: Request, res: Response) => {
    try {
        const id = req.body.user.id;
        const user: IUser | null = await User.findById(id);
        const customUser = {
            firstName: user?.username.split(' ')[0],
            lastName: user?.username.split(' ')[1],
            email: user?.email,
            role: user?.role
        };
        res.status(200).json(customUser);
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