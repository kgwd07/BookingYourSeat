// // File: lib/database.js
// // Database helper functions for server components

// import clientPromise from './mongodb';

// export async function getAllSeats() {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
    
//     // Get all seats
//     return await db.collection('seats').find({}).toArray();
//   } catch (error) {
//     console.error('Database error:', error);
//     throw new Error('Failed to fetch seats');
//   }
// }

// export async function getSeatsByUserId(userId) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
    
//     // Get seats booked by this user
//     return await db.collection('seats').find({ bookedBy: userId }).toArray();
//   } catch (error) {
//     console.error('Database error:', error);
//     throw new Error('Failed to fetch user seats');
//   }
// }

// export async function initializeSeatsIfNeeded() {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
    
//     // Check if seats collection exists and has data
//     const seatsCount = await db.collection('seats').countDocuments();
    
//     if (seatsCount === 0) {
//       // Initialize seats
//       const seatsData = Array(80).fill(null).map((_, index) => ({
//         id: index + 1,
//         booked: false,
//         bookedBy: null,
//         bookingTime: null
//       }));
      
//       await db.collection('seats').insertMany(seatsData);
//       console.log('Initialized 80 seats');
//       return true;
//     }
    
//     return false;
//   } catch (error) {
//     console.error('Database initialization error:', error);
//     throw new Error('Failed to initialize seats');
//   }
// }


//! FOR POSTGRE

import prisma from './prisma';

/**
 * Get all seats from the database
 */
export async function getAllSeats() {
  try {
    return await prisma.seat.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch seats');
  }
}

/**
 * Get seats booked by a specific user
 */
export async function getSeatsByUserId(userId) {
  try {
    return await prisma.seat.findMany({
      where: {
        bookedBy: userId,
      },
      orderBy: {
        id: 'asc',
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch user seats');
  }
}

/**
 * Initialize seats if they don't exist
 */
export async function initializeSeatsIfNeeded() {
  try {
    // Check if seats already exist
    const seatCount = await prisma.seat.count();
    
    if (seatCount === 0) {
      // Create bulk insert data
      const seatsData = Array(80).fill(null).map((_, index) => ({
        id: index + 1,
        booked: false,
        bookedBy: null,
        bookingTime: null
      }));
      
      // Use createMany for bulk insert
      await prisma.seat.createMany({
        data: seatsData,
        skipDuplicates: true,
      });
      
      console.log('Initialized 80 seats');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Failed to initialize seats');
  }
}

/**
 * Book seats for a user
 */
export async function bookSeats(seatIds, userId) {
  try {
    const bookingTime = new Date();
    
    // Update all seats in a transaction
    return await prisma.$transaction(async (tx) => {
      // Verify all seats are available first
      const seats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
        },
      });
      
      if (seats.length !== seatIds.length) {
        throw new Error('One or more seats not found');
      }
      
      const unavailableSeats = seats.filter(seat => seat.booked);
      
      if (unavailableSeats.length > 0) {
        throw new Error('Some seats are already booked');
      }
      
      // All seats are available, proceed with booking
      const bookingPromises = seatIds.map(seatId =>
        tx.seat.update({
          where: { id: seatId },
          data: {
            booked: true,
            bookedBy: userId,
            bookingTime,
          },
        })
      );
      
      return await Promise.all(bookingPromises);
    });
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
}

/**
 * Cancel bookings for a user
 */
export async function cancelBookings(seatIds, userId) {
  try {
    // Update all seats in a transaction
    return await prisma.$transaction(async (tx) => {
      // Verify all seats are booked by this user
      const seats = await tx.seat.findMany({
        where: {
          id: { in: seatIds },
          bookedBy: userId,
        },
      });
      
      if (seats.length !== seatIds.length) {
        throw new Error('You can only cancel seats that you have booked');
      }
      
      // All seats are booked by this user, proceed with cancellation
      const cancellationPromises = seatIds.map(seatId =>
        tx.seat.update({
          where: { id: seatId },
          data: {
            booked: false,
            bookedBy: null,
            bookingTime: null,
          },
        })
      );
      
      return await Promise.all(cancellationPromises);
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    throw error;
  }
}