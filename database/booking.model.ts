import mongoose, { Document, Model, Schema } from 'mongoose';
import Event from './event.model';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // RFC 5322 compliant email regex (simplified)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Compound unique index to prevent duplicate bookings and optimize event-based queries
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Pre-save hook to validate that the referenced event exists
BookingSchema.pre('save', async function () {
  const booking = this as IBooking;

  // Only validate if eventId is new or modified
  if (booking.isModified('eventId')) {
    try {
      const eventExists = await Event.findById(booking.eventId);

      if (!eventExists) {
        throw new Error('The referenced event does not exist');
      }
    } catch (error) {
      throw new Error('Failed to validate event reference');
    }
  }
});

// Prevent model recompilation in Next.js development
const Booking: Model<IBooking> = 
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
