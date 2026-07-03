import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Only seed in development
    if (process.env.NODE_ENV === "production") {
      console.log("⚠️  Skipping seed in production environment");
      return;
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: "admin" },
    });

    if (existingAdmin) {
      console.log("✓ Demo superadmin account already exists");
      console.log("  Username: admin");
      console.log("  Password: admin123");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create demo superadmin
    const admin = await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("✓ Demo superadmin account created successfully!");
    console.log("  Username: admin");
    console.log("  Password: admin123");
    console.log("  Role: ADMIN");
    console.log("  ID:", admin.id);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
