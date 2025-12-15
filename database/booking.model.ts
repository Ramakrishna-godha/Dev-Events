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

// Index for faster event-based queries
BookingSchema.index({ eventId: 1 });

// Compound index for preventing duplicate bookings (optional but recommended)
BookingSchema.index({ eventId: 1, email: 1 });

// Pre-save hook to validate that the referenced event exists
BookingSchema.pre('save', async function (next) {
  const booking = this as IBooking;

  // Only validate if eventId is new or modified
  if (booking.isModified('eventId')) {
    try {
      const eventExists = await Event.findById(booking.eventId);
      
      if (!eventExists) {
        return next(new Error('The referenced event does not exist'));
      }
    } catch (error) {
      return next(new Error('Failed to validate event reference'));
    }
  }

  next();
});

// Prevent model recompilation in Next.js development
const Booking: Model<IBooking> = 
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
