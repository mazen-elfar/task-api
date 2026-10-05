const mongoose = require('mongoose');
const { TASK_STATUS, TASK_STATUS_VALUES } = require('../constants/taskStatus');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUS_VALUES,
        message: 'Status must be one of: {VALUES}',
      },
      default: TASK_STATUS.PENDING,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to an authenticated user owner'],
      index: true,
    },
  },
  {
    timestamps: true, // Automatically provides createdAt and updatedAt
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to optimize queries for a specific user's tasks sorted by creation date
taskSchema.index({ owner: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
