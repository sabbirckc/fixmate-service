import "dotenv/config";
import { auth } from "../lib/auth";

async function seed() {
  const users = [
    {
      email: "admin@fixmate.com",
      password: "Password123",
      name: "FixMate System Admin",
      role: "admin",
      phone: "+880 1800 000001",
      area: "Gulshan 2, Dhaka",
      bio: "Master administrator for FixMate service network and technician operations.",
    },
    {
      email: "technician@fixmate.com",
      password: "Password123",
      name: "Rahim Chowdhury (Master Tech)",
      role: "technician",
      phone: "+880 1711 223344",
      area: "Dhanmondi 27, Dhaka",
      bio: "Certified electronics and device repair specialist with 8+ years experience in smartphones, motherboards, and micro-soldering.",
    },
    {
      email: "customer@fixmate.com",
      password: "Password123",
      name: "Tanvir Ahmed",
      role: "customer",
      phone: "+880 1912 345678",
      area: "Uttara Sector 7, Dhaka",
      bio: "Frequent FixMate customer booking electronics and appliance servicing.",
    },
  ];

  for (const u of users) {
    try {
      console.log(`Creating user: ${u.email}...`);
      const res = await auth.api.signUpEmail({
        body: {
          email: u.email,
          password: u.password,
          name: u.name,
          role: u.role,
          phone: u.phone,
          area: u.area,
          bio: u.bio,
        },
      });
      console.log(`Created: ${u.email}`, res?.user?.id || "OK");
    } catch (err: any) {
      console.log(`Note for ${u.email}:`, err?.message || err);
    }
  }

  console.log("Seeding demo accounts completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
