const Task = require('../models/Task');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Create a new task strictly bound to the authenticated owner.
 * Any owner field in taskData is ignored to prevent privilege escalation.
 *
 * @param {string} ownerId - ID of the authenticated user
 * @param {Object} taskData - { title, description, status }
 * @returns {Promise<Object>}
 */
const createTask = async (ownerId, { title, description, status }) => {
  const taskPayload = {
    title,
    description: description !== undefined ? description : '',
    owner: ownerId,
  };

  if (status) {
    taskPayload.status = status;
  }

  const task = await Task.create(taskPayload);
  return task;
};

/**
 * Retrieve tasks belonging to the authenticated owner with optional status filtering and pagination.
 *
 * @param {string} ownerId - ID of the authenticated user
 * @param {Object} query - Query parameters (status, page, limit)
 * @returns {Promise<{ tasks: Array<Object>, meta: Object }>}
 */
const getTasks = async (ownerId, query = {}) => {
  const filter = { owner: ownerId };

  if (query.status) {
    filter.status = query.status;
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    tasks,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Retrieve a specific task by ID belonging to the authenticated owner.
 * Returns 404 if not found or if the task belongs to another user (prevents existence leaks).
 *
 * @param {string} ownerId - ID of the authenticated user
 * @param {string} taskId - MongoDB ObjectId of the task
 * @returns {Promise<Object>}
 */
const getTaskById = async (ownerId, taskId) => {
  const task = await Task.findOne({ _id: taskId, owner: ownerId });

  if (!task) {
    throw new AppError('Task not found.', HTTP_STATUS.NOT_FOUND);
  }

  return task;
};

/**
 * Update an existing task belonging to the authenticated owner.
 * Returns 404 if not found or if the task belongs to another user.
 *
 * @param {string} ownerId - ID of the authenticated user
 * @param {string} taskId - MongoDB ObjectId of the task
 * @param {Object} updateData - Partial task fields to update
 * @returns {Promise<Object>}
 */
const updateTask = async (ownerId, taskId, updateData) => {
  // Ensure owner cannot be transferred via updateData
  const safeUpdate = { ...updateData };
  delete safeUpdate.owner;
  delete safeUpdate._id;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, owner: ownerId },
    { $set: safeUpdate },
    { returnDocument: 'after', runValidators: true }
  );

  if (!task) {
    throw new AppError('Task not found.', HTTP_STATUS.NOT_FOUND);
  }

  return task;
};

/**
 * Delete a task belonging to the authenticated owner.
 * Returns 404 if not found or if the task belongs to another user.
 *
 * @param {string} ownerId - ID of the authenticated user
 * @param {string} taskId - MongoDB ObjectId of the task
 * @returns {Promise<Object>}
 */
const deleteTask = async (ownerId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, owner: ownerId });

  if (!task) {
    throw new AppError('Task not found.', HTTP_STATUS.NOT_FOUND);
  }

  return task;
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
