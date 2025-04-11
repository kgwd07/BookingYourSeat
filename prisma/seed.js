// Prisma seed script to initialize the database
// Run with: npx prisma db seed

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  // Check if seats already exist
  const seatCount = await prisma.seat.count();
  
  if (seatCount === 0) {
    // Create 80 seats
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
    
    console.log(`Created ${seatsData.length} seats`);
  } else {
    console.log(`Database already contains ${seatCount} seats, skipping seed`);
  }
  
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });