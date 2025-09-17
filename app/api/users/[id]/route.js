import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDB } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

// Get user by ID
export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Users can only access their own profile unless they're admin
    if (token.role !== 'admin' && token.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await User.findById(params.id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    await connectToDB();
    
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Users can only update their own profile unless they're admin
    if (token.role !== 'admin' && token.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { username, email, walletAddress, role } = await request.json();
    
    // Check if email or username is already taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: params.id } },
        { $or: [{ email }, { username }] }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already taken' },
        { status: 400 }
      );
    }
    
    const updateData = { username, email, walletAddress };
    
    // Only allow role update for admins
    if (token.role === 'admin' && role) {
      updateData.role = role;
    }
    
    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// Delete user
export async function DELETE(request, { params }) {
  try {
    await connectToDB();
    
    // Check if user is admin
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Prevent admin from deleting themselves
    if (token.userId === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}