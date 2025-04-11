import { auth } from '@clerk/nextjs';
import { getAllSeats, initializeSeatsIfNeeded } from '@/lib/database';
import TicketBookingClient from '@/components/ticket-booking-client';
import { UserButton } from '@clerk/nextjs';

export default async function BookTicket() {
  // Initialize seats if needed (only on first run)
  await initializeSeatsIfNeeded();
  
  // Get current auth state
  const { userId } = auth();
  
  // Fetch all seats from the database
  const seats = await getAllSeats();
  
  // Transform data for the client component
  const seatsData = seats.map((seat:any) => ({
    id: seat.id,
    booked: seat.booked,
    bookedBy: seat.bookedBy,
    bookedByMe: userId ? seat.bookedBy === userId : false,
    bookingTime: seat.bookingTime,
  }));
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-4">
        <UserButton afterSignOutUrl="/" />
      </div>
      
      <TicketBookingClient 
        initialSeats={seatsData} 
        isSignedIn={Boolean(userId)} 
      />
    </div>
  );
}