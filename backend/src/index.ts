import 'dotenv/config';
import { createApp } from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

async function promoteAdminEmail() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail) return;
  const result = await prisma.user.updateMany({
    where: { email: adminEmail, role: { not: 'ADMIN' } },
    data: { role: 'ADMIN', confirmed: true },
  });
  if (result.count > 0) {
    console.log(`Konto ${adminEmail} zostało awansowane do roli ADMIN`);
  }
}

const app = createApp();

app.listen(config.port, '0.0.0.0', async () => {
  console.log(`Backend uruchomiony na http://0.0.0.0:${config.port}`);
  await promoteAdminEmail();
});
