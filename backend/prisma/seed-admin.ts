import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { RoleName } from '../src/generated/prisma/enums.js';

const SYSTEM_ADMIN_PERMISSION_CODES = [
  'STAFF_VIEW',
  'STAFF_MANAGE',
  'SHIFT_VIEW',
  'SHIFT_MANAGE',
  'ATTENDANCE_VIEW',
  'LEAVE_APPROVE',
];

async function bootstrapAdmin(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME?.trim();
  const adminPhoneInput = process.env.ADMIN_PHONE?.trim();

  if (!connectionString) {
    throw new Error('DATABASE_URL is required.');
  }
  if (!adminEmail || !adminPassword || !adminFullName) {
    throw new Error(
      'Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_FULL_NAME must all be set.',
    );
  }
  if (adminPassword.length < 6) {
    throw new Error('ADMIN_PASSWORD must be at least 6 characters long.');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Check if Admin account already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: { role: true },
    });

    if (existingUser) {
      console.log(
        `[seed:admin] Admin account already exists for "${adminEmail}" (role: ${existingUser.role.name}). Skipping without modifying password, role, or permissions.`,
      );
      return;
    }

    // 2. Find existing ADMIN role (do not create a duplicate or new role if ADMIN exists)
    let adminRole = await prisma.role.findUnique({
      where: { name: RoleName.ADMIN },
      include: { rolePermissions: true },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: RoleName.ADMIN,
          description: 'System Administrator',
        },
        include: { rolePermissions: true },
      });
    }

    // 3. Assign system administration permissions only if ADMIN role currently has none
    if (adminRole.rolePermissions.length === 0) {
      const existingPerms = await prisma.permission.findMany({
        where: { code: { in: SYSTEM_ADMIN_PERMISSION_CODES } },
      });
      if (existingPerms.length > 0) {
        await prisma.rolePermission.createMany({
          data: existingPerms.map((p) => ({
            roleId: adminRole!.id,
            permissionId: p.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    // 4. Determine a unique phone number (User.phone is required & unique in schema)
    let phone = adminPhoneInput || '0900000000';
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      phone = `0999${Date.now().toString().slice(-6)}`;
    }

    // 5. Hash password using project's bcrypt implementation
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const created = await prisma.user.create({
      data: {
        email: adminEmail,
        phone,
        fullName: adminFullName,
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isActive: true,
        role: { select: { name: true } },
      },
    });

    console.log(
      `[seed:admin] Super Admin created: ${created.fullName} <${created.email}> (role: ${created.role.name})`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

bootstrapAdmin().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[seed:admin] Failed: ${message}`);
  process.exit(1);
});
