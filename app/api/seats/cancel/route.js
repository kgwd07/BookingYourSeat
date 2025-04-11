// import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import { auth } from '@clerk/nextjs';

// export async function POST(request) {
//   const { userId } = auth();
  
//   if (!userId) {
//     return NextResponse.json(
//       { message: 'Authentication required' },
//       { status: 401 }
//     );
//   }

//   try {
//     const { seatIds } = await request.json();

//     if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
//       return NextResponse.json(
//         { message: 'Valid seat IDs are required' },
//         { status: 400 }
//       );
//     }

//     const client = await clientPromise;
//     const db = client.db();
    
//     // Check if all seats are booked by this user
//     const seats = await db.collection('seats')
//       .find({ 
//         id: { $in: seatIds },
//         bookedBy: userId
//       })
//       .toArray();
    
//     if (seats.length !== seatIds.length) {
//       return NextResponse.json(
//         { message: 'You can only cancel seats that you have booked' },
//         { status: 403 }
//       );
//     }
    
//     // Cancel the bookings
//     await db.collection('seats').updateMany(
//       { id: { $in: seatIds } },
//       { 
//         $set: {
//           booked: false,
//           bookedBy: null,
//           bookingTime: null
//         }
//       }
//     );
    
//     return NextResponse.json({ 
//       message: 'Seat bookings cancelled successfully',
//       cancelledSeats: seatIds
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { cancelBookings } from '@/lib/database';

export async function POST(request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { message: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { seatIds } = await request.json();

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { message: 'Valid seat IDs are required' },
        { status: 400 }
      );
    }

    try {
      // Attempt to cancel bookings (this will throw if not authorized)
      await cancelBookings(seatIds, userId);
      
      return NextResponse.json({ 
        message: 'Seat bookings cancelled successfully',
        cancelledSeats: seatIds
      });
    } catch (error) {
      if (error.message === 'You can only cancel seats that you have booked') {
        return NextResponse.json(
          { message: error.message },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}