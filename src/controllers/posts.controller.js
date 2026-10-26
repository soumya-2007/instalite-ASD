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
    const posts = await postsService.listPosts();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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