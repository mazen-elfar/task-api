const taskService = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private (Authenticated User)
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user._id, req.body);

  return sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    'Task created successfully.',
    task
  );
});

/**
 * @desc    Get all tasks for the authenticated user
 * @route   GET /api/tasks
 * @access  Private (Authenticated User)
 */
const getTasks = asyncHandler(async (req, res) => {
  const { tasks, meta } = await taskService.getTasks(req.user._id, req.query);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    'Tasks retrieved successfully.',
    tasks,
    meta
  );
});

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private (Authenticated User)
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user._id, req.params.id);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    'Task retrieved successfully.',
    task
  );
});

/**
 * @desc    Update a task by ID (partial update)
 * @route   PATCH /api/tasks/:id
 * @access  Private (Authenticated User)
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user._id, req.params.id, req.body);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    'Task updated successfully.',
    task
  );
});

/**
 * @desc    Delete a task by ID
 * @route   DELETE /api/tasks/:id
 * @access  Private (Authenticated User)
 */
const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user._id, req.params.id);

  return sendSuccess(
    res,
    HTTP_STATUS.OK,
    'Task deleted successfully.',
    {}
  );
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
