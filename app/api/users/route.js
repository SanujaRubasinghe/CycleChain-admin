import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDB } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

// Get all users (admin only)
export async function GET(request) {
  try {
    await connectToDB();
    
    // Check if user is admin
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const users = await User.find({}).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// Create a new user (admin only)
export async function POST(request) {
  try {
    await connectToDB();
    
    // Check if user is admin
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { username, email, password, role, walletAddress } = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Create new user (password will be hashed in the model)
    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      walletAddress: walletAddress || ''
    });
    
    await user.save();
    
    // Return user without password
    const userWithoutPassword = await User.findById(user._id).select('-password');
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}