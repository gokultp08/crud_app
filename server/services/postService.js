const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { config } = require("../config");
const CustomError = require("../helpers/customError");
const logger = require("../helpers/logger");

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        Comment: true,
      },
    });
    return res.status(200).json(posts);
  } catch (e) {
    logger.error(e.message);
    return next(CustomError(e.message));
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        id: Number(req.params.id),
      },
      include: {
        Comment: true,
      },
    });

    if (post.authorId !== req.currentUserId) {
      return next(CustomError("Unauthorized", 403));
    }

    return res.status(200).json(post);
  } catch (e) {
    logger.error(e.message);
    return next(CustomError(e.message));
  }
};

const getPostsForUser = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: Number(req.params.userId),
      },
      include: {
        Comment: true,
      },
    });

    return res.status(200).json(posts);
  } catch (e) {
    logger.error(e.message);
    return next(CustomError(e.message));
  }
};

const addPost = async (req, res, next) => {
  const { content, authorId } = req.body;

  try {
    const newPost = await prisma.post.create({
      data: { content, authorId: Number(authorId) },
    });

    return res.status(200).json({
      message: "Added Successfully",
      data: newPost,
    });
  } catch (e) {
    logger.error(e.message);
    next(CustomError(e.message));
  }
};

const editPost = async (req, res, next) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findFirst({
    where: {
      id,
    },
  });

  if (post.authorId !== req.currentUserId) {
    logger.error("Unauthorized to edit");
    return next(CustomError("Unauthorized to edit", 403));
  }

  const { content } = req.body;

  try {
    await prisma.post.update({
      where: {
        id,
      },
      data: {
        content,
      },
    });
    return res.status(200).json({
      message: "Updated Successfully",
    });
  } catch (e) {
    logger.error(e.message);
    return next(CustomError(e.message));
  }
};

const deletePost = async (req, res, next) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findFirst({
    where: {
      id,
    },
  });

  if (post.authorId !== req.currentUserId) {
    logger.error("Unauthorized to delete");
    return next(CustomError("Unauthorized to delete", 403));
  }

  try {
    await prisma.post.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      message: "Deleted Successfully",
    });
  } catch (e) {
    logger.error(e.message);
    return next(CustomError(e.message));
  }
};

module.exports = {
  addPost,
  getAllPosts,
  getPost,
  deletePost,
  getPostsForUser,
  editPost,
};
