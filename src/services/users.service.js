const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

async function listUsers(page, limit, sortBy, order, isPrivate, search) {
  const skip = (page - 1) * limit;

  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search !== undefined) {
    where.OR = [
      {
        username: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        fullname: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    data,
    total,
  };
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

async function deleteUser(id) {
  return prisma.user.delete({
    where: { id },
  });
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
