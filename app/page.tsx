import Image from 'next/image';
import LandingImg from '../assets/seats-theater-svgrepo-com.svg'
import Logo from '../assets/movie-tickets-svgrepo-com.svg'
import { Button } from '@/components/ui/button';
import Link from 'next/link';


const HomePage = () => {
  return <main>
    <header  className="max-w-6xl mx-auto px-4 sm:px-8 py-6"
    >
      <Image src={Logo} alt='logo' height={'50'}/>
    </header>
    <section className="max-w-6xl mx-auto px-4 sm:px-8 h-screen -mt-20 grid lg:grid-cols-[1fr,400px] items-center" >
      <div>
        <h1 className='capitalize text-4xl md:text-7xl font-bold '>
        BOOK<span className='text-primary'>TICKET</span>
        </h1>
        <p className='leading-loose max-w-md mt-4'>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ab non eligendi sequi magnam corrupti quidem pariatur vel, reiciendis maxime omnis excepturi ut labore cum delectus dolorum sapiente minus fugiat vitae?f
        </p>
        <Button asChild className='mt-4'>
          <Link href="/book-ticket">Start Booking</Link>
        </Button>
      </div>
      <Image src={LandingImg}  alt='landing' className='hidden lg:block'/>
    </section>
  </main>
};
export default HomePage;

// import { auth } from '@clerk/nextjs';
// import { getAllSeats, initializeSeatsIfNeeded } from '@/lib/database';
// import TicketBookingClient from '@/components/ticket-booking-client';
// import { UserButton } from '@clerk/nextjs';

// export default async function Home() {
//   // Initialize seats if needed (only on first run)
//   await initializeSeatsIfNeeded();
  
//   // Get current auth state
//   const { userId } = auth();
  
//   // Fetch all seats from the database
//   const seats = await getAllSeats();
  
//   // Transform data for the client component
//   const seatsData = seats.map((seat:any) => ({
//     id: seat.id,
//     booked: seat.booked,
//     bookedBy: seat.bookedBy,
//     bookedByMe: userId ? seat.bookedBy === userId : false,
//     bookingTime: seat.bookingTime,
//   }));
  
//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-end mb-4">
//         <UserButton afterSignOutUrl="/" />
//       </div>
      
//       <TicketBookingClient 
//         initialSeats={seatsData} 
//         isSignedIn={Boolean(userId)} 
//       />
//     </div>
//   );
// }