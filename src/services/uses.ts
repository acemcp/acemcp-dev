// import { NextResponse } from 'next/server';
// import { UserService } from '@/services/user.service';

// /**
//  * Handles GET requests to fetch all users.
//  */
// export async function GET() {
//   try {
//     const users = await UserService.getAllUsers();
//     return NextResponse.json(users);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to fetch users' },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Handles POST requests to create a new user.
//  * @param request - The incoming Next.js request object.
//  */
// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     // It's a good practice to validate the request body here
//     // before passing it to the service.
//     const newUser = await UserService.createUser(body);
//     return NextResponse.json(newUser, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to create user' },
//       { status: 500 }
//     );
//   }
// }


// import { NextResponse } from 'next/server';
// import { UserService } from '@/services/user.service';

// interface Params {
//   params: {
//     id: string;
//   };
// }

// /**
//  * Handles GET requests to fetch a single user by their ID.
//  */
// export async function GET(request: Request, { params }: Params) {
//   try {
//     const user = await UserService.getUserById(params.id);
//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }
//     return NextResponse.json(user);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to fetch user' },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Handles PATCH requests to update a user's information.
//  */
// export async function PATCH(request: Request, { params }: Params) {
//   try {
//     const body = await request.json();
//     const updatedUser = await UserService.updateUser(params.id, body);
//     return NextResponse.json(updatedUser);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to update user' },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Handles DELETE requests to remove a user.
//  */
// export async function DELETE(request: Request, { params }: Params) {
//   try {
//     const deletedUser = await UserService.deleteUser(params.id);
//     return NextResponse.json(deletedUser);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: 'Failed to delete user' },
//       { status: 500 }
//     );
//   }
// }
