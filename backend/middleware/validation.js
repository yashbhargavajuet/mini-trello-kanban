const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = {};
    errors.array().forEach(error => {
      extractedErrors[error.path] = error.msg;
    });
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  next();
};

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters')
    .trim(),
  
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  
  handleValidationErrors
];

// Workspace validation rules
const validateWorkspaceCreation = [
  body('name')
    .notEmpty()
    .withMessage('Workspace name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Workspace name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim(),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  
  body('visibility')
    .optional()
    .isIn(['private', 'workspace', 'public'])
    .withMessage('Visibility must be private, workspace, or public'),
  
  handleValidationErrors
];

const validateWorkspaceUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Workspace name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim(),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  
  body('visibility')
    .optional()
    .isIn(['private', 'workspace', 'public'])
    .withMessage('Visibility must be private, workspace, or public'),
  
  handleValidationErrors
];

// Board validation rules
const validateBoardCreation = [
  body('title')
    .notEmpty()
    .withMessage('Board title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  
  body('visibility')
    .optional()
    .isIn(['private', 'workspace', 'public'])
    .withMessage('Visibility must be private, workspace, or public'),
  
  body('background.type')
    .optional()
    .isIn(['color', 'image'])
    .withMessage('Background type must be color or image'),
  
  body('background.value')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Background value must be between 1 and 200 characters'),
  
  handleValidationErrors
];

const validateBoardUpdate = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  
  body('visibility')
    .optional()
    .isIn(['private', 'workspace', 'public'])
    .withMessage('Visibility must be private, workspace, or public'),
  
  handleValidationErrors
];

// List validation rules
const validateListCreation = [
  body('title')
    .notEmpty()
    .withMessage('List title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('List title must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number'),
  
  handleValidationErrors
];

const validateListUpdate = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('List title must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number'),
  
  handleValidationErrors
];

// Card validation rules
const validateCardCreation = [
  body('title')
    .notEmpty()
    .withMessage('Card title is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Card title must be between 1 and 500 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Description must not exceed 10000 characters')
    .trim(),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  
  body('assignees.*')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Each assignee must be a valid user ID'),
  
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
  
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number'),
  
  handleValidationErrors
];

const validateCardUpdate = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Card title must be between 1 and 500 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Description must not exceed 10000 characters')
    .trim(),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
  
  body('assignees')
    .optional()
    .isArray()
    .withMessage('Assignees must be an array'),
  
  body('assignees.*')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Each assignee must be a valid user ID'),
  
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
  
  handleValidationErrors
];

// Comment validation rules
const validateCommentCreation = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Comment text must be between 1 and 10000 characters')
    .trim(),
  
  handleValidationErrors
];

const validateCommentUpdate = [
  body('text')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Comment text must be between 1 and 10000 characters')
    .trim(),
  
  handleValidationErrors
];

// Parameter validation rules
const validateObjectId = (paramName) => [
  param(paramName)
    .custom(isValidObjectId)
    .withMessage(`${paramName} must be a valid ID`),
  
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim(),
  
  query('assignee')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Assignee must be a valid user ID'),
  
  query('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array'),
  
  query('dueDate')
    .optional()
    .isIn(['overdue', 'due-soon', 'no-due-date'])
    .withMessage('Due date filter must be overdue, due-soon, or no-due-date'),
  
  handleValidationErrors
];

// Member role validation
const validateMemberRole = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'member', 'viewer', 'editor', 'commenter', 'owner'])
    .withMessage('Role must be admin, member, viewer, editor, commenter, or owner'),
  
  handleValidationErrors
];

// Label validation
const validateLabelCreation = [
  body('name')
    .notEmpty()
    .withMessage('Label name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Label name must be between 1 and 50 characters')
    .trim()
    .escape(),
  
  body('color')
    .notEmpty()
    .withMessage('Label color is required')
    .isIn(['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'sky', 'lime', 'gray'])
    .withMessage('Label color must be one of the predefined colors'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateWorkspaceCreation,
  validateWorkspaceUpdate,
  validateBoardCreation,
  validateBoardUpdate,
  validateListCreation,
  validateListUpdate,
  validateCardCreation,
  validateCardUpdate,
  validateCommentCreation,
  validateCommentUpdate,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateMemberRole,
  validateLabelCreation
};