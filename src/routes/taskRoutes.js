const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  getTasksQuerySchema,
} = require('../validators/taskValidator');

const router = express.Router();

// Protect all task routes with JWT authentication
router.use(authenticate);

router
  .route('/')
  .post(validate(createTaskSchema), taskController.createTask)
  .get(validate(getTasksQuerySchema), taskController.getTasks);

router
  .route('/:id')
  .get(validate(taskIdParamSchema), taskController.getTaskById)
  .patch(
    validate({
      params: taskIdParamSchema.params,
      body: updateTaskSchema.body,
    }),
    taskController.updateTask
  )
  .delete(validate(taskIdParamSchema), taskController.deleteTask);

module.exports = router;
