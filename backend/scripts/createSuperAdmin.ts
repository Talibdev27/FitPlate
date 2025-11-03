import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  const email = 'mukhammadaminkhonesaev@gmail.com';
  const password = 'Dilnoza2003';
  const firstName = 'Muhammadamin';
  const lastName = 'Khon';
  const phone = '+998901957603'; // Using the phone from the registration form

  try {
    // Check if super admin already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    });

    if (existingStaff) {
      console.log('Super admin already exists with this email.');
      // Update password if needed
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.staff.update({
        where: { email },
        data: {
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
      console.log('Super admin password updated.');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin
    const staff = await prisma.staff.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('Super admin created successfully!');
    console.log('Email:', staff.email);
    console.log('Role:', staff.role);
    console.log('ID:', staff.id);
  } catch (error) {
    console.error('Error creating super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();

