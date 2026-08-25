import { config } from "dotenv";
config();

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL || "admin@painel.local"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "trocar123";
  const name = process.env.SEED_ADMIN_NAME || "Administrador";

  const [{ db }, { users }] = await Promise.all([
    import("./client"),
    import("./schema"),
  ]);

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log(`Seed ignorado: usuário ${email} já existe.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    name,
    email,
    passwordHash,
    role: "admin",
  });

  console.log("Usuário admin criado:");
  console.log(`  e-mail: ${email}`);
  console.log(`  senha:  ${password} (altere após o primeiro login)`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Falha ao rodar seed:", error);
  process.exit(1);
});
