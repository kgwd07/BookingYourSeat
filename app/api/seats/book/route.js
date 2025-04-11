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
    
//     // Check if all seats are available
//     const seats = await db.collection('seats')
//       .find({ id: { $in: seatIds } })
//       .toArray();
    
//     if (seats.length !== seatIds.length) {
//       return NextResponse.json(
//         { message: 'One or more seats not found' },
//         { status: 400 }
//       );
//     }
    
//     const unavailableSeats = seats.filter(seat => seat.booked);
    
//     if (unavailableSeats.length > 0) {
//       return NextResponse.json(
//         { 
//           message: 'Some seats are already booked',
//           unavailableSeats: unavailableSeats.map(seat => seat.id)
//         },
//         { status: 409 }
//       );
//     }
    
//     // Book the seats
//     const bookingTime = new Date();
    
//     // Update seats collection
//     await db.collection('seats').updateMany(
//       { id: { $in: seatIds } },
//       { 
//         $set: {
//           booked: true,
//           bookedBy: userId,
//           bookingTime
//         }
//       }
//     );
    
//     return NextResponse.json({ 
//       message: 'Seats booked successfully',
//       bookedSeats: seatIds
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
import { bookSeats } from '@/lib/database';

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
      // Attempt to book seats (this will throw if seats are unavailable)
      await bookSeats(seatIds, userId);
      
      return NextResponse.json({ 
        message: 'Seats booked successfully',
        bookedSeats: seatIds
      });
    } catch (error) {
      if (error.message === 'Some seats are already booked') {
        return NextResponse.json(
          { 
            message: 'Some seats are already booked',
            unavailableSeats: [] // We could fetch these if needed
          },
          { status: 409 }
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