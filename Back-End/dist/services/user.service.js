"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}
async function createUser(name, email, password, role = 'seller', storeId = 1) {
    // NOTE: 'role' and 'storeId' are required by the Prisma schema.
    // Ensure 'storeId' exists in DB or pass one explicitly from the controller.
    return prisma.user.create({ data: { name, email, password, role, storeId } });
}
async function getAllUsers() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
}
async function getUserById(id) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
}
async function updateUser(id, data) {
    return prisma.user.update({ where: { id }, data });
}
async function deleteUser(id) {
    return prisma.user.delete({ where: { id } });
}
