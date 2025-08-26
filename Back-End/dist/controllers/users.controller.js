"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserController = exports.updateUserController = exports.createUserController = exports.getUserByIdController = exports.getAllUsersController = void 0;
const user_service_1 = require("../services/user.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getAllUsersController = async (req, res) => {
    const users = await (0, user_service_1.getAllUsers)();
    res.json(users);
};
exports.getAllUsersController = getAllUsersController;
const getUserByIdController = async (req, res) => {
    const { id } = req.params;
    const user = await (0, user_service_1.getUserById)(Number(id));
    if (!user)
        return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json(user);
};
exports.getUserByIdController = getUserByIdController;
const createUserController = async (req, res) => {
    const { name, email, password } = req.body;
    if (!password)
        return res.status(400).json({ message: 'Senha obrigatória' });
    const hashedPassword = bcryptjs_1.default.hashSync(password, 8);
    const user = await (0, user_service_1.createUser)(name, email, hashedPassword);
    res.status(201).json(user);
};
exports.createUserController = createUserController;
const updateUserController = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    const data = {};
    if (name)
        data.name = name;
    if (email)
        data.email = email;
    if (role)
        data.role = role;
    if (password)
        data.password = bcryptjs_1.default.hashSync(password, 8);
    try {
        const user = await (0, user_service_1.updateUser)(Number(id), data);
        res.json(user);
    }
    catch (err) {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
};
exports.updateUserController = updateUserController;
const deleteUserController = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, user_service_1.deleteUser)(Number(id));
        res.status(204).send();
    }
    catch (err) {
        res.status(404).json({ message: 'Usuário não encontrado' });
    }
};
exports.deleteUserController = deleteUserController;
