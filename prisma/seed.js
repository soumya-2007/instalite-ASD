const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const userResult = await prisma.user.createMany({
    data: users,
  });

  const postResult = await prisma.post.createMany({
    data: posts,
  });

  console.log(`Seeded ${userResult.count} users`);
  console.log(`Seeded ${postResult.count} posts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });