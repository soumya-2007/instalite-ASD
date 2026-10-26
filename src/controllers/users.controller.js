const usersService = require("../services/users.service");

async function create(req, res) {
  try {
    const { username, email, fullname, bio } = req.body;

    if (!username || !email || !fullname) {
      return res
        .status(400)
        .json({ error: "username, email and fullname are required" });
    }

    const user = await usersService.createUser({
      username,
      email,
      fullname,
      bio,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "username or email already taken" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
}
async function list(req, res) {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    let limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page <= 0 ||
      !Number.isInteger(limit) ||
      limit <= 0
    ) {
      return res.status(400).json({
        error: "page and limit must be positive integers",
      });
    }

    limit = Math.min(limit, 50);

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    const allowedSortFields = ["createdAt", "username", "fullname"];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: "sortBy must be one of: createdAt, username, fullname",
      });
    }

    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({
        error: "order must be asc or desc",
      });
    }

    const { data, total } = await usersService.listUsers(
      page,
      limit,
      sortBy,
      order
    );

    res.status(200).json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  try {
    const id = Number(req.params.id);

    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);

    const data = {};

    if (req.body.fullname !== undefined) {
      data.fullname = req.body.fullname;
    }

    if (req.body.bio !== undefined) {
      data.bio = req.body.bio;
    }

    if (req.body.isPrivate !== undefined) {
      data.isPrivate = req.body.isPrivate;
    }

    const user = await usersService.updateUser(id, data);

    res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);

    await usersService.deleteUser(id);

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};