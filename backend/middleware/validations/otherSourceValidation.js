const { validationResult, body } = require('express-validator');

const rules = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('active')
        .notEmpty().withMessage('Active is required')
        .isBoolean().withMessage('Active must be a boolean')
    ];

const otherSourceValidate = async (req, res, next) => {
    
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
    otherSourceValidate
};
