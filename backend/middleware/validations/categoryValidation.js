const {validationResult, body } = require('express-validator');

const rules = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .trim()
        .isLength({ max: 255 }).withMessage('Name cannot exceed 255 characters'),
    body('active')
        .optional()
        .isBoolean().withMessage('Active must be a boolean')
];


const categoryValidate = async (req, res, next) => {
    
    await Promise.all(rules.map(rule => rule.run(req)));
     
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push(err.msg));

    return res.status(422).json({
        errors: extractedErrors,
    });
};

module.exports = {
    categoryValidate
};

