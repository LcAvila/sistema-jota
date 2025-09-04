// Mock data for development - replace with Supabase integration
export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  storeId: number;
  createdAt: Date;
};

export type UserSafe = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
};

// Mock users for development
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    password: '$2a$08$hash', // bcrypt hash for 'password'
    role: 'admin',
    storeId: 1,
    createdAt: new Date()
  }
];

export async function findUserByEmail(email: string): Promise<User | null> {
  return mockUsers.find(user => user.email === email) || null;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: string = 'seller',
  storeId: number = 1,
): Promise<User> {
  const newUser: User = {
    id: mockUsers.length + 1,
    name,
    email,
    password,
    role,
    storeId,
    createdAt: new Date()
  };
  mockUsers.push(newUser);
  return newUser;
}

export async function getAllUsers(): Promise<UserSafe[]> {
  return mockUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));
}

export async function getUserById(id: number): Promise<UserSafe | null> {
  const user = mockUsers.find(u => u.id === id);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

export async function updateUser(id: number, data: Partial<User>): Promise<User | null> {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) return null;
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
  return mockUsers[userIndex];
}

export async function deleteUser(id: number): Promise<User | null> {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) return null;
  
  return mockUsers.splice(userIndex, 1)[0];
}
