const postsService = require("../services/posts.service");

async function create(req, res) {
  try {
    const { imageUrl, caption, location } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: "imageUrl is required",
      });
    }

    const post = await postsService.createPost({
      imageUrl,
      caption,
      location,
    });

    res.status(201).json(post);
  } catch (error) {
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

    const allowedSortFields = ["createdAt", "updatedAt"];

    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: "sortBy must be one of: createdAt, updatedAt",
      });
    }

    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({
        error: "order must be asc or desc",
      });
    }

    const location = req.query.location;
    const search = req.query.search;

    let from;
    let to;

    if (req.query.from !== undefined) {
      from = new Date(req.query.from);

      if (Number.isNaN(from.getTime())) {
        return res.status(400).json({
          error: "from and to must be valid dates",
        });
      }
    }

    if (req.query.to !== undefined) {
      to = new Date(req.query.to);

      if (Number.isNaN(to.getTime())) {
        return res.status(400).json({
          error: "from and to must be valid dates",
        });
      }
    }

    const { data, total } = await postsService.listPosts(
      page,
      limit,
      sortBy,
      order,
      location,
      search,
      from,
      to
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

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
async function getOne(req, res) {
  try {
    const id = Number(req.params.id);

    const post = await postsService.getPostById(id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);

    const data = {};

    if (req.body.caption !== undefined) {
      data.caption = req.body.caption;
    }

    if (req.body.location !== undefined) {
      data.location = req.body.location;
    }

    const post = await postsService.updatePost(id, data);

    res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);

    await postsService.deletePost(id);

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Post not found",
      });
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