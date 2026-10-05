/**
 * Controlled enum values for Task status.
 */
const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
});

const TASK_STATUS_VALUES = Object.freeze(Object.values(TASK_STATUS));

module.exports = {
  TASK_STATUS,
  TASK_STATUS_VALUES,
};
