import { auth, currentUser } from '@clerk/nextjs';
import { getSeatsByUserId } from '@/lib/database';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import MyBookingsClient from '../../components/my-bookings-client';

export default async function MyBookingsPage() {
  // Get current auth state
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
          <p className="mb-4">You need to sign in to view your bookings.</p>
          <Link href="/sign-in" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  // Fetch all seats booked by this user
  const bookedSeats = await getSeatsByUserId(userId);
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Link href="/book-ticket" className="text-blue-500 hover:text-blue-700">
          &larr; Back to Booking
        </Link>
        <UserButton afterSignOutUrl="/" />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
        <p className="mb-4">
          Welcome back, {user.firstName || user.emailAddresses[0].emailAddress}
        </p>
        
        <MyBookingsClient bookedSeats={bookedSeats} />
      </div>
    </div>
  );
}