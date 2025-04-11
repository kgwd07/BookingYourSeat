'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TicketBookingClient({ initialSeats, isSignedIn }) {
  const router = useRouter();
  
  // Initialize state with server-provided data
  const [seats, setSeats] = useState(
    initialSeats.map(seat => ({
      ...seat,
      selected: false // Add selected property for client-side state
    }))
  );
  
  const [seatCount, setSeatCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  
  // Calculate available seats
  const availableSeats = seats.filter(seat => !seat.booked && !seat.selected).length;
  
  // Function to handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers 1-7
    if (/^[1-7]?$/.test(value)) {
      setSeatCount(value);
    }
  };
  
  // Function to find consecutive available seats in a row, prioritizing forward seats
  const findConsecutiveSeats = (count) => {
    // Each row has 7 seats
    const numRows = Math.ceil(seats.length / 7);
    
    // First attempt: Try to find consecutive seats in each row, starting from front rows
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const rowStart = rowIndex * 7;
      const rowEnd = Math.min(rowStart + 7, seats.length);
      
      // Check if we can find 'count' consecutive seats in this row
      let availableConsecutive = [];
      
      for (let i = rowStart; i < rowEnd; i++) {
        if (!seats[i].booked && !seats[i].selected) {
          availableConsecutive.push(i);
          
          if (availableConsecutive.length === count) {
            return availableConsecutive;
          }
        } else {
          // Reset if we hit a booked or selected seat
          availableConsecutive = [];
        }
      }
    }
    
    // Second attempt: If no consecutive seats in any row, take any available seats
    // starting from the forward seats (lower IDs)
    const availableIndices = seats
      .map((seat, index) => ({ 
        index, 
        available: !seat.booked && !seat.selected 
      }))
      .filter(seat => seat.available)
      .map(seat => seat.index)
      .slice(0, count);
    
    if (availableIndices.length === count) {
      return availableIndices;
    }
    
    return null; // No seats available
  };
  
  // Function to handle booking from input field
  const handleBookSeats = (num) => {
    if (!isSignedIn) {
      setError('You must be signed in to book seats');
      return;
    }
    
    const count = Number(num);
    
    if (isNaN(count) || count <= 0 || count > 7) {
      setError('Please enter a valid number of seats (1-7)');
      return;
    }
    
    if (count > availableSeats) {
      setError(`Sorry, only ${availableSeats} seats are available`);
      return;
    }
    
    // Find consecutive seats if possible, otherwise take any available seats
    const seatsToBook = findConsecutiveSeats(count);
    
    if (seatsToBook) {
      const updatedSeats = [...seats];
      seatsToBook.forEach(seatIndex => {
        updatedSeats[seatIndex] = {
          ...updatedSeats[seatIndex],
          selected: true
        };
      });
      
      setSeats(updatedSeats);
      setSeatCount('');
      setError(null);
    } else {
      setError('Sorry, not enough seats are available for your group size');
    }
  };
  
  // Handle booking when user enters a number and presses Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && seatCount) {
      e.preventDefault();
      handleBookSeats(seatCount);
    }
  };
  
  // Function to handle direct seat selection by clicking
  const handleSeatClick = (seatId) => {
    if (!isSignedIn) {
      setError('You must be signed in to select seats');
      return;
    }
    
    const seatIndex = seats.findIndex(s => s.id === seatId);
    const seat = seats[seatIndex];
    
    // If seat is already selected, deselect it
    if (seat && seat.selected) {
      const updatedSeats = [...seats];
      updatedSeats[seatIndex] = {
        ...updatedSeats[seatIndex],
        selected: false
      };
      setSeats(updatedSeats);
      setError(null);
      return;
    }
    
    // If seat is not booked, select it
    if (seat && !seat.booked && !seat.selected) {
      const updatedSeats = [...seats];
      updatedSeats[seatIndex] = {
        ...updatedSeats[seatIndex],
        selected: true
      };
      setSeats(updatedSeats);
      setError(null);
    }
  };
  
  // Function to confirm booking of selected seats
  const confirmBooking = async () => {
    if (!isSignedIn) {
      setError('You must be signed in to book seats');
      return;
    }
    
    const selectedSeatIds = seats
      .filter(seat => seat.selected)
      .map(seat => seat.id);
    
    if (selectedSeatIds.length === 0) {
      setError('No seats selected');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/seats/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatIds: selectedSeatIds }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // Some seats became unavailable while the user was making a selection
          setError(`Some seats have been booked by another user. Please try again.`);
          // Refresh the page to get updated seat information
          router.refresh();
        } else {
          throw new Error(data.message || 'Failed to book seats');
        }
      } else {
        // Successful booking
        setBookingStatus(`Successfully booked ${selectedSeatIds.length} seats!`);
        
        // Update the local state to reflect the booking
        const updatedSeats = [...seats];
        selectedSeatIds.forEach(id => {
          const index = updatedSeats.findIndex(seat => seat.id === id);
          if (index !== -1) {
            updatedSeats[index] = {
              ...updatedSeats[index],
              booked: true,
              bookedByMe: true,
              selected: false // Clear selection after booking
            };
          }
        });
        
        setSeats(updatedSeats);
        setError(null);
        
        // Refresh the page after a short delay to show the updated state from the server
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setError('Failed to book seats. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to cancel a booking
  const cancelBooking = async (seatId) => {
    if (!isSignedIn) {
      setError('You must be signed in to cancel bookings');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/seats/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatIds: [seatId] }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel booking');
      }
      
      setBookingStatus(`Successfully cancelled seat #${seatId}`);
      
      // Update the seat in the local state
      const updatedSeats = [...seats];
      const seatIndex = updatedSeats.findIndex(seat => seat.id === seatId);
      
      if (seatIndex !== -1) {
        updatedSeats[seatIndex] = {
          ...updatedSeats[seatIndex],
          booked: false,
          bookedBy: null,
          bookedByMe: false
        };
        setSeats(updatedSeats);
      }
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
      
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle seat actions based on current state
  const handleSeatAction = (seatId) => {
    const seat = seats.find(s => s.id === seatId);
    
    if (!seat) return;
    
    // If seat is booked by the current user, show confirmation to cancel
    if (seat.booked && seat.bookedByMe) {
      if (confirm(`Do you want to cancel your booking for seat #${seatId}?`)) {
        cancelBooking(seatId);
      }
      return;
    }
    
    // Otherwise handle normal seat selection/deselection
    handleSeatClick(seatId);
  };
  
  // Function to reset booking - clear selections
  const resetBooking = () => {
    setSeats(seats.map(seat => ({
      ...seat,
      selected: false
    })));
    setSeatCount('');
    setError(null);
    setBookingStatus(null);
  };
  
  // Function to determine seat color
  const getSeatColor = (seat) => {
    if (seat.booked) {
      return seat.bookedByMe ? '#FF9999' : '#FF5252'; // Red for booked, lighter red for booked by me
    }
    if (seat.selected) return '#F9A826'; // Yellow for selected seats
    return '#78B159'; // Green for available
  };

  return (
    <div className="flex flex-col bg-gray-200 p-4 rounded-lg max-w-4xl mx-auto">
      <div className="text-2xl font-bold text-center py-4 bg-gray-100 rounded-t-lg">
        Ticket Booking
        {isSignedIn ? (
          <div className="text-sm font-normal mt-1">
            <Link href="/my-bookings" className="text-blue-500 hover:text-blue-700">
              View My Bookings
            </Link>
          </div>
        ) : (
          <div className="text-sm font-normal mt-1">
            <Link href="/sign-in" className="text-blue-500 hover:text-blue-700">
              Sign in to book tickets
            </Link>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 my-2">
          {error}
        </div>
      )}
      
      {bookingStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-4 my-2">
          {bookingStatus}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row p-4 gap-4">
        {/* Seats grid - left side */}
        <div className="w-full md:w-2/3 p-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-7 gap-2">
            {seats.map((seat) => (
              <div 
                key={seat.id}
                className={`flex items-center justify-center h-10 rounded-md font-medium text-black ${
                  seat.booked 
                    ? (seat.bookedByMe ? 'cursor-pointer' : 'cursor-not-allowed') 
                    : 'cursor-pointer'
                }`}
                style={{ backgroundColor: getSeatColor(seat) }}
                onClick={() => handleSeatAction(seat.id)}
                title={
                  seat.booked 
                    ? (seat.bookedByMe 
                      ? 'Booked by you - Click to cancel' 
                      : 'Already booked by someone else') 
                    : seat.selected 
                      ? 'Selected - Click to deselect' 
                      : 'Available - Click to select'
                }
              >
                {seat.id}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#78B159' }}></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#F9A826' }}></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#FF5252' }}></div>
              <span className="text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#FF9999' }}></div>
              <span className="text-sm">Booked by you</span>
            </div>
          </div>
        </div>
        
        {/* Booking panel - right side */}
        <div className="w-full md:w-1/3">
          <div className="mt-4 md:mt-16">
            <div className="text-lg mb-4">Book Seats</div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {seats.filter(seat => seat.selected).map(seat => (
                <div
                  key={seat.id}
                  className="w-12 h-10 bg-yellow-400 rounded-md flex items-center justify-center font-semibold"
                >
                  {seat.id}
                </div>
              ))}
              {seats.filter(seat => seat.selected).length === 0 && (
                <div className="text-gray-500">No seats selected</div>
              )}
            </div>
            
            <div className="flex mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={seatCount}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full p-2 border rounded-md"
                  placeholder="1-7"
                  disabled={!isSignedIn}
                />
                {seatCount && parseInt(seatCount) > availableSeats && (
                  <div className="absolute right-2 top-3 text-red-500">⊘</div>
                )}
              </div>
              
              <button 
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md border border-blue-600 hover:bg-blue-600 disabled:opacity-50"
                onClick={() => seatCount && handleBookSeats(seatCount)}
                disabled={!seatCount || !isSignedIn}
              >
                Find Seats
              </button>
            </div>
            

            <div className="flex gap-4 mb-6">
              <button 
                onClick={confirmBooking}
                className="flex-1 p-3 bg-primary rounded-md text-center text-white font-semibold hover:bg-green-600 disabled:opacity-50"
                disabled={seats.filter(seat => seat.selected).length === 0 || !isSignedIn || loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              
              <button 
                onClick={resetBooking}
                className="flex-1 p-3 bg-blue-200 rounded-md text-center text-blue-800 hover:bg-blue-300 disabled:opacity-50"
                disabled={seats.filter(seat => seat.selected).length === 0 || loading}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 px-6 py-2 mt-4 bg-gray-100 rounded-b-lg">
        <div>
          <div className="inline-block px-6 py-2 bg-yellow-400 rounded-md">
            Selected Seats = {seats.filter(seat => seat.selected).length}
          </div>
        </div>
        <div>
          <div className="inline-block px-6 py-2 bg-green-600 rounded-md text-white">
            Available Seats = {availableSeats}
          </div>
        </div>
      </div>
    </div>
  );
}