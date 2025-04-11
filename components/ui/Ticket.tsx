// "use client"
// import React, { useState } from 'react';

// // Define TypeScript interfaces
// interface Seat {
//   id: number;
//   booked: boolean;
//   selected: boolean;
// }

// const TicketBooking: React.FC = () => {
//   // State for managing seats - 80 seats total as shown in the image
//   const [seats, setSeats] = useState<Seat[]>(
//     Array(80).fill(null).map((_, index) => ({
//       id: index + 1,
//       booked: false, // Initially no seats are booked
//       selected: false // Initially no seats are selected
//     }))
//   );
  
//   // State for the input field
//   const [seatCount, setSeatCount] = useState<string>('');
  
//   // Calculate available seats
//   const availableSeats: number = seats.filter(seat => !seat.selected).length;
  
//   // Function to handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
//     const value = e.target.value;
//     // Only allow numbers 1-7
//     if (/^[1-7]?$/.test(value)) {
//       setSeatCount(value);
//     }
//   };
  
//   // Function to find consecutive available seats in a row, prioritizing forward seats
//   const findConsecutiveSeats = (count: number): number[] | null => {
//     // Each row has 7 seats as shown in the image
//     const numRows: number = Math.ceil(seats.length / 7);
    
//     // First attempt: Try to find consecutive seats in each row, starting from front rows
//     for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
//       const rowStart: number = rowIndex * 7;
//       const rowEnd: number = Math.min(rowStart + 7, seats.length);
      
//       // Check if we can find 'count' consecutive seats in this row
//       let availableConsecutive: number[] = [];
      
//       for (let i = rowStart; i < rowEnd; i++) {
//         if (!seats[i].selected) {
//           availableConsecutive.push(i);
          
//           if (availableConsecutive.length === count) {
//             return availableConsecutive;
//           }
//         } else {
//           // Reset if we hit a selected seat
//           availableConsecutive = [];
//         }
//       }
//     }
    
//     // Second attempt: If no consecutive seats in any row, take any available seats
//     // starting from the forward seats (lower IDs)
//     const availableIndices: number[] = seats
//       .map((seat, index): { index: number; selected: boolean } => ({ 
//         index, 
//         selected: seat.selected 
//       }))
//       .filter((seat): boolean => !seat.selected)
//       .map((seat): number => seat.index)
//       .slice(0, count);
    
//     if (availableIndices.length === count) {
//       return availableIndices;
//     }
    
//     return null; // No seats available
//   };
  
//   // Function to handle booking from number buttons or input field
//   const handleBookSeats = (num: string): void => {
//     const count: number = Number(num);
    
//     if (isNaN(count) || count <= 0 || count > 7) {
//       alert('Please enter a valid number of seats (1-7)');
//       return;
//     }
    
//     const remainingSeats: number = seats.filter(seat => !seat.selected).length;
    
//     if (count > remainingSeats) {
//       alert(`Sorry, only ${remainingSeats} seats are available`);
//       return;
//     }
    
//     // Keep previously selected seats - don't reset them
//     // Find consecutive seats if possible, otherwise take any available seats
//     const seatsToBook: number[] | null = findConsecutiveSeats(count);
    
//     if (seatsToBook) {
//       const updatedSeats: Seat[] = [...seats];
//       seatsToBook.forEach((seatIndex: number): void => {
//         updatedSeats[seatIndex] = {
//           ...updatedSeats[seatIndex],
//           selected: true
//         };
//       });
      
//       setSeats(updatedSeats);
//       setSeatCount('');
//     } else {
//       alert('Sorry, not enough seats are available for your group size');
//     }
//   };
  
//   // Handle booking when user enters a number and presses Enter
//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
//     if (e.key === 'Enter' && seatCount) {
//       e.preventDefault();
//       handleBookSeats(seatCount);
//     }
//   };
  
//   // Function to handle direct seat selection by clicking
//   const handleSeatClick = (seatId: number): void => {
//     const seat: Seat | undefined = seats.find(s => s.id === seatId);
//     if (seat && !seat.selected) {
//       const updatedSeats: Seat[] = [...seats];
//       const seatIndex: number = updatedSeats.findIndex(s => s.id === seatId);
//       updatedSeats[seatIndex] = {
//         ...updatedSeats[seatIndex],
//         selected: true
//       };
//       setSeats(updatedSeats);
//     }
//   };
  
//   // Function to reset booking - keep original booked seats but clear selections
//   const resetBooking = (): void => {
//     setSeats(seats.map((seat): Seat => ({
//       ...seat,
//       selected: false
//     })));
//     setSeatCount('');
//   };
  
//   // Function to determine seat color based on the image
//   const getSeatColor = (seat: Seat): string => {
//     if (seat.selected) return '#F9A826'; // Yellow for selected seats
//     return '#78B159'; // Green for available
//   };

//   return (
//     <div className="flex flex-col bg-gray-200 p-4 rounded-lg max-w-4xl mx-auto">
//       <div className="text-2xl font-bold text-center py-4 bg-gray-100 rounded-t-lg">Ticket Booking</div>
      
//       <div className="flex flex-col md:flex-row p-4 gap-4">
//         {/* Seats grid - left side */}
//         <div className="w-full md:w-2/3 p-6 bg-white rounded-lg shadow">
//           <div className="grid grid-cols-7 gap-2">
//             {seats.map((seat) => (
//               <div 
//                 key={seat.id}
//                 className="flex items-center justify-center h-10 rounded-md font-medium text-black cursor-pointer"
//                 style={{ backgroundColor: getSeatColor(seat) }}
//                 onClick={() => !seat.selected && handleSeatClick(seat.id)}
//               >
//                 {seat.id}
//               </div>
//             ))}
//           </div>
//         </div>
        
//         {/* Booking panel - right side */}
//         <div className="w-full md:w-1/3">
//           <div className="mt-4 md:mt-16">
//             <div className="text-lg mb-4">Book Seats</div>
            
//             <div className="flex flex-wrap gap-2 mb-6">
//               {seats.filter(seat => seat.selected).map(seat => (
//                 <div
//                   key={seat.id}
//                   className="w-12 h-10 bg-yellow-400 rounded-md flex items-center justify-center font-semibold"
//                 >
//                   {seat.id}
//                 </div>
//               ))}
//               {seats.filter(seat => seat.selected).length === 0 && (
//                 <div className="text-gray-500">No seats selected</div>
//               )}
//             </div>
            
//             <div className="flex mb-6">
//               <div className="flex-1 relative">
//                 <input
//                   type="text"
//                   value={seatCount}
//                   onChange={handleInputChange}
//                   onKeyPress={handleKeyPress}
//                   className="w-full p-2 border rounded-md"
//                   placeholder="1-7"
//                 />
//                 {seatCount && parseInt(seatCount) > availableSeats && (
//                   <div className="absolute right-2 top-3 text-red-500">⊘</div>
//                 )}
//               </div>
              
//               <button 
//                 className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md border border-blue-600 hover:bg-blue-600"
//                 onClick={() => seatCount && handleBookSeats(seatCount)}
//                 disabled={!seatCount}
//               >
//                 Submit
//               </button>
//             </div>
            
//             <button 
//               onClick={resetBooking}
//               className="w-full p-3 bg-blue-200 rounded-md text-center text-blue-800"
//             >
//               Reset Booking
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <div className="flex flex-col sm:flex-row sm:justify-between gap-2 px-6 py-2 mt-4 bg-gray-100 rounded-b-lg">
//         <div>
//           <div className="inline-block px-6 py-2 bg-yellow-400 rounded-md">
//             Selected Seats = {seats.filter(seat => seat.selected).length}
//           </div>
//         </div>
//         <div>
//           <div className="inline-block px-6 py-2 bg-green-600 rounded-md text-white">
//             Available Seats = {availableSeats}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TicketBooking;

