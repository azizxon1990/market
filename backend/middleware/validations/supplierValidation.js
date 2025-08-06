const { validationResult, body } = require('express-validator');

const rules = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('phone_number')
        .notEmpty().withMessage('Phone number is required')
        .isString().withMessage('Phone number must be a string')
        .isMobilePhone().withMessage('Phone number must be a valid phone number'),
    body('active')
        .notEmpty().withMessage('Active is required')
        .isBoolean().withMessage('Active must be a boolean')
    ];

const supplierValidate = async (req, res, next) => {
   
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
}

module.exports = {
    supplierValidate
};