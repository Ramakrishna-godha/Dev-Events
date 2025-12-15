import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        overview: {
            type: String,
            required: [true, 'Overview is required'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Image is required'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
        },
        time: {
            type: String,
            required: [true, 'Time is required'],
        },
        mode: {
            type: String,
            required: [true, 'Mode is required'],
            enum: {
                values: ['online', 'offline', 'hybrid'],
                message: 'Mode must be online, offline, or hybrid',
            },
            lowercase: true,
        },
        audience: {
            type: String,
            required: [true, 'Audience is required'],
            trim: true,
        },
        agenda: {
            type: [String],
            required: [true, 'Agenda is required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Agenda must contain at least one item',
            },
        },
        organizer: {
            type: String,
            required: [true, 'Organizer is required'],
            trim: true,
        },
        tags: {
            type: [String],
            required: [true, 'Tags are required'],
            validate: {
                validator: (v: string[]) => Array.isArray(v) && v.length > 0,
                message: 'Tags must contain at least one item',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster slug-based queries
EventSchema.index({ slug: 1 });

// Pre-save hook for slug generation and date/time normalization
EventSchema.pre('save', async function () {
    const event = this as IEvent;

    // Generate slug if title changed
    if (event.isModified('title')) {
        event.slug = event.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Normalize date to YYYY-MM-DD
    if (event.isModified('date')) {
        const parsedDate = new Date(event.date);

        if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date format. Please provide a valid date.');
        }

        event.date = parsedDate.toISOString().split('T')[0];
    }

    // Normalize time to HH:MM
    if (event.isModified('time')) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

        if (!timeRegex.test(event.time)) {
            throw new Error(
                'Invalid time format. Please use HH:MM format (e.g., 14:30).'
            );
        }

        const [hours, minutes] = event.time.split(':');
        event.time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
});

// Prevent model recompilation in Next.js development
const Event: Model<IEvent> =
    mongoose.models.Event ||
    mongoose.model<IEvent>('Event', EventSchema);

export default Event;
