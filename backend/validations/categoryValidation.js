const { validationResult, body } = require('express-validator');

const validateCategory = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('parent_id')
        .optional()
        .isInt().withMessage('Parent ID must be an integer')
];

const checkValidationResult = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errors.array();
    }
    return [];
};

module.exports = {
    validateCategory,
    checkValidationResult
};
