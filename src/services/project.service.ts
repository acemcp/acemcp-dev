import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Service class for Project-related database operations.
 */
export const ProjectService = {
  /**
   * Creates a new project.
   * @param data - The data for the new project, including the owner's ID.
   * @returns The newly created project.
   */
  async createProject(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({
      data,
    });
  },

  /**
   * Retrieves all projects.
   * @returns A list of all projects.
   */
  async getAllProjects() {
    return prisma.project.findMany({
      include: { owner: true }, // Include the owner's details
    });
  },

  /**
   * Retrieves a project by its ID.
   * @param id - The ID of the project.
   * @returns The project object or null if not found.
   */
  async getProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { sessions: true }, // Include related sessions
    });
  },

  /**
   * Retrieves all projects belonging to a specific user.
   * @param ownerId - The ID of the project owner.
   * @returns A list of projects for the specified user.
   */
  async getProjectsByOwner(ownerId: string) {
    return prisma.project.findMany({
      where: { ownerId },
    });
  },

  /**
   * Updates a project's information.
   * @param id - The ID of the project to update.
   * @param data - The data to update.
   * @returns The updated project object.
   */
  async updateProject(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
    });
  },

  /**
   * Deletes a project.
   * @param id - The ID of the project to delete.
   * @returns The deleted project object.
   */
  async deleteProject(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  },
};
