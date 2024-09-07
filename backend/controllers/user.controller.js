import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user._id);

    if (targetUserId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot follow or unfollow yourself." });
    }

    if (!targetUser || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow the target user
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: targetUserId },
      });

      res.status(200).json({ message: "Successfully unfollowed the user" });
    } else {
      // Follow the target user
      await User.findByIdAndUpdate(targetUserId, {
        $push: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: targetUserId },
      });

      // Create and save a new follow notification
      const followNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: targetUser._id,
      });

      await followNotification.save();

      res.status(200).json({ message: "Successfully followed the user" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Retrieve the IDs of users followed by the current user
    const { following: followedUserIds } = await User.findById(
      currentUserId
    ).select("following");

    // Aggregate pipeline to find suggested users
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId }, // Exclude the current user
          _id: { $nin: followedUserIds }, // Exclude already followed users
        },
      },
      { $sample: { size: 10 } }, // Sample a larger set to ensure diversity
      {
        $project: {
          password: 0, // Exclude password field from the results
        },
      },
    ]);

    // Limit the number of users to 4
    const topSuggestions = suggestedUsers.slice(0, 4);

    res.status(200).json(topSuggestions);
  } catch (error) {
    console.error("Error in getSuggestedUsers: ", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching suggested users." });
  }
};

export const updateUser = async (req, res) => {
  const {
    fullName,
    email,
    username,
    currentPassword,
    newPassword,
    bio,
    link,
    profileImg,
    coverImg,
  } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: "Please provide both current password and new password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        const publicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        const publicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploadedResponse.secure_url;
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (link) user.link = link;

    await user.save();

    const { password, ...updatedUser } = user.toObject();

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
