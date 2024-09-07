import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text, img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && !img) {
      return res
        .status(400)
        .json({ error: "Post must contain either text or an image" });
    }

    let imageUrl = null;

    if (img) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(img);
        imageUrl = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res
          .status(500)
          .json({ error: "Image upload failed. Please try again." });
      }
    }

    const newPost = new Post({
      user: userId,
      text: text || "",
      img: imageUrl,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id.toString();

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      try {
        const imgId = post.img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
        return res
          .status(500)
          .json({ error: "Failed to delete post image. Please try again." });
      }
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);

    await post.save();

    res.status(200).json({ message: "Comment added successfully", post });
  } catch (error) {
    console.error("Error in commentOnPost controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res
        .status(200)
        .json({ message: "Post unliked", likes: updatedLikes });
    } else {
      post.likes.push(userId);

      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      await post.save();

      if (post.user.toString() !== userId) {
        const notification = new Notification({
          from: userId,
          to: post.user,
          type: "like",
          post: postId,
        });
        await notification.save();
      }

      return res.status(200).json({ message: "Post liked", likes: post.likes });
    }
  } catch (error) {
    console.error("Error in likeUnlikePost controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "fullName username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "fullName username profileImg",
      });

    if (!posts.length) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("likedPosts");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "fullName username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "fullName username profileImg",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error in getLikedPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("following");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.following.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "fullName username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "fullName username profileImg",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.error("Error in getFollowingPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("_id");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "fullName username profileImg",
      })
      .populate({
        path: "comments.user",
        select: "fullName username profileImg",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getUserPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
