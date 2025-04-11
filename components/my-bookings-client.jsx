'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyBookingsClient({ bookedSeats }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Toggle seat selection
  const toggleSeatSelection = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };
  
  // Cancel selected bookings
  const cancelBookings = async () => {
    if (selectedSeats.length === 0) {
      setError('No seats selected for cancellation');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/seats/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatIds: selectedSeats }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel bookings');
      }
      
      setSuccess(`Successfully cancelled ${selectedSeats.length} booking(s)`);
      setSelectedSeats([]);
      setError(null);
      
      // Refresh the page after a delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err) {
      setError('Failed to cancel bookings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (bookedSeats.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">You haven't booked any seats yet.</p>
        <a href="/book-ticket" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">
          Go to Booking Page
        </a>
      </div>
    );
  }
  
  // Format the booking date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <p className="mb-2">You have {bookedSeats.length} active booking(s)</p>
        <button
          onClick={cancelBookings}
          disabled={selectedSeats.length === 0 || loading}
           className="btn bg-primary text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Cancel Selected (${selectedSeats.length})`}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Select</th>
              <th className="px-4 py-2 text-left">Seat #</th>
              <th className="px-4 py-2 text-left">Booking Time</th>
            </tr>
          </thead>
          <tbody>
            {bookedSeats.sort((a, b) => a.id - b.id).map((seat) => (
              <tr key={seat.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedSeats.includes(seat.id)}
                    onChange={() => toggleSeatSelection(seat.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-2">{seat.id}</td>
                <td className="px-4 py-2">{formatDate(seat.bookingTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}