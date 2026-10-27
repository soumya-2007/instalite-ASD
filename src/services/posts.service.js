const prisma = require("../db");

async function createPost(data) {
  return prisma.post.create({
    data,
  });
}

async function listPosts(
  page,
  limit,
  sortBy,
  order,
  location,
  search,
  from,
  to
) {
  const skip = (page - 1) * limit;

  const where = {};

  if (location !== undefined) {
    where.location = {
      equals: location,
      mode: "insensitive",
    };
  }

  if (search !== undefined) {
    where.caption = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (from !== undefined || to !== undefined) {
    where.createdAt = {};

    if (from !== undefined) {
      where.createdAt.gte = from;
    }

    if (to !== undefined) {
      where.createdAt.lt = to;
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),

    prisma.post.count({
      where,
    }),
  ]);

  return {
    data,
    total,
  };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
  });
}

async function updatePost(id, data) {
  return prisma.post.update({
    where: { id },
    data,
  });
}

async function deletePost(id) {
  return prisma.post.delete({
    where: { id },
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};