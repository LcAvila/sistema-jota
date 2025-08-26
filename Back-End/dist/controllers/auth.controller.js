"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_service_1 = require("../services/user.service");
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const login = async (req, res) => {
    console.log('Tentando login:', req.body.email, req.body.password);
    const { email, password } = req.body;
    const user = await (0, user_service_1.findUserByEmail)(email);
    console.log('Usuário encontrado:', user);
    if (user) {
        console.log('Senha enviada:', password, 'Hash no banco:', user.password);
        console.log('Resultado bcrypt:', bcryptjs_1.default.compareSync(password, user.password));
    }
    if (!user || !bcryptjs_1.default.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, storeId: user.storeId }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, storeId: user.storeId } });
};
exports.login = login;
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await (0, user_service_1.findUserByEmail)(email);
    if (existing) {
        return res.status(400).json({ message: 'E-mail já cadastrado' });
    }
    const hashedPassword = bcryptjs_1.default.hashSync(password, 8);
    const newUser = await (0, user_service_1.createUser)(name, email, hashedPassword);
    const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role, storeId: newUser.storeId }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, storeId: newUser.storeId } });
};
exports.register = register;
