import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for User-related database operations.
 */
export const UserService = {
  /**
   * Creates a new user in the database.
   * @param data - The data for the new user.
   * @returns The newly created user.
   */
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  },

  /**
   * Retrieves all users from the database.
   * @returns A list of all users.
   */
  async getAllUsers() {
    return prisma.user.findMany();
  },

  /**
   * Retrieves a single user by their unique ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object or null if not found.
   */
  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        projects: true, // Also include related projects
        sessions: true, // Also include related sessions
      },
    });
  },

  /**
   * Updates a user's information.
   * @param id - The ID of the user to update.
   * @param data - The data to update.
   * @returns The updated user object.
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a user from the database.
   * @param id - The ID of the user to delete.
   * @returns The deleted user object.
   */
  async deleteUser(id: string) {
    // Note: Deleting a user might fail if they still have related records
    // (e.g., projects, sessions) due to foreign key constraints.
    // You might need to handle cascading deletes in your schema or application logic.
    return prisma.user.delete({
      where: { id },
    });
  },
};