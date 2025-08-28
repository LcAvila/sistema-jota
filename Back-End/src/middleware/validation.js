const Joi = require('joi');

// Schemas de validação
const schemas = {
  // Login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ser válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  // Produto
  product: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().precision(2).required(),
    cost: Joi.number().positive().precision(2).required(),
    stock: Joi.number().integer().min(0).default(0),
    categoryId: Joi.number().integer().positive().optional(),
    sku: Joi.string().min(3).max(50).optional(),
    barcode: Joi.string().max(50).optional(),
    minStock: Joi.number().integer().min(0).optional(),
    unit: Joi.string().max(20).optional(),
    active: Joi.boolean().default(true)
  }),

  // Usuário
  user: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'SELLER', 'MANAGER').required(),
    storeId: Joi.number().integer().positive().required(),
    active: Joi.boolean().default(true)
  }),

  // Pedido
  order: Joi.object({
    clientId: Joi.number().integer().positive().required(),
    sellerId: Joi.number().integer().positive().required(),
    storeId: Joi.number().integer().positive().required(),
    total: Joi.number().positive().precision(2).required(),
    status: Joi.string().valid('pending', 'preparing', 'ready', 'delivered', 'cancelled').required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        unitPrice: Joi.number().positive().precision(2).required()
      })
    ).min(1).required()
  })
};

// Middleware de validação
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ message: 'Schema de validação não encontrado' });
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Dados inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Substituir req.body pelos dados validados
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};
