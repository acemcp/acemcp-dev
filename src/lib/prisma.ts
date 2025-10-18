import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client instance.
// This is necessary to prevent creating new connections on every hot reload in development.
declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate the Prisma client.
// If we're in a development environment and a prisma instance already exists, use it.
// Otherwise, create a new PrismaClient instance.
const prisma = global.prisma || new PrismaClient();

// If we're in a development environment, assign the prisma instance to the global variable.
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// Export the prisma instance to be used throughout the application.
export default prisma;