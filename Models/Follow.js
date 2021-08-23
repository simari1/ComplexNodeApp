"use strict";

const usersCollection = require("../Utils/db")
  .db("ComplexApp")
  .collection("user");
const followsCollection = require("../Utils/db")
  .db("ComplexApp")
  .collection("follows");
const ObjectID = require("mongodb").ObjectID;
const User = require("./User");

let Follow = function (followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
};

Follow.prototype.cleanUp = async function () {
  if (typeof this.followedUsername != "string") {
    this.followedUsername = "";
  }
};

Follow.prototype.validate = async function (action) {
  // followedUsername must exist in database
  let followedAccount = await usersCollection.findOne({
    username: this.followedUsername,
  });

  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push("You cannot follow a user that does not exist.");
  }

  let doesFollowAlreadyExist = await followsCollection.findOne({
    followedId: this.followedId,
    authorId: new ObjectID(this.authorId),
  });
  if (action == "create") {
    if (doesFollowAlreadyExist) {
      this.errors.push("You are already following this user.");
    }
  }
  if (action == "delete") {
    if (!doesFollowAlreadyExist) {
      this.errors.push(
        "You cannot stop following someone you do not already follow."
      );
    }
  }
  // should not be able to follow yourself
  if (this.followedId.equals(this.authorId)) {
    this.errors.push("You cannot follow yourself.");
  }
};

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("create");
    if (!this.errors.length) {
      await followsCollection.insertOne({
        followedId: this.followedId,
        authorId: new ObjectID(this.authorId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("delete");
    if (!this.errors.length) {
      await followsCollection.deleteOne({
        followedId: this.followedId,
        authorId: new ObjectID(this.authorId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

//static methods
Follow.isVisitorFollowing = async function (followedId, visitorId) {
  let followDoc = await followsCollection.findOne({
    followedId: followedId,
    authorId: new ObjectID(visitorId),
  });
  if (followDoc) {
    return true;
  } else {
    return false;
  }
};

Follow.getFollowersById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let followers = await followsCollection
        .aggregate([
          { $match: { followedId: id } },
          {
            $lookup: {
              from: "user",
              localField: "authorId",
              foreignField: "_id",
              as: "userDoc",
            },
          },
          {
            $project: {
              userDoc: {
                username: 1,
                email: 1,
              },
              // username: { $arrayElemAt: ["$userDoc.username", 0] },
              // email: { $arrayElemAt: ["$userDoc.email", 0] },
            },
          },
        ])
        .toArray();
      followers = followers.map(function (follower) {
        let user = new User(follower.userDoc[0], true);
        return { username: follower.userDoc[0].username, avatar: user.avatar };
      });
      resolve(followers);
    } catch {
      reject();
    }
  });
};

// Follow.getFollowersById = function (id) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let followers = await followsCollection
//         .aggregate(
//           {
//             $match: { followedId: id },
//           },
//           {
//             $lookup: {
//               from: "user",
//               localField: "authorId",
//               foreignField: "_id",
//               as: "userDoc",
//             },
//           },
//           {
//             $project: {
//               // userDoc: {
//               //   username: 1,
//               //   email: 1,
//               // },
//               username: {$arrayElemAt: ["$userDoc.username", 0]},
//               email: {$arrayElemAt: ["$userDoc.email", 0]}
//             },
//           }
//         )
//         .toArray();
//       console.log("1 " + followers);
//       followers = followers.map(function (follower) {
//         console.log("1.1 " + follower);
//         let user = new User(follower, true);
//         console.log("1.2 " + user);
//         return { username: follower.username, avatar: user.avatar };
//       });
//       console.log("2 " + followers);
//       resolve(followers);
//     } catch (error) {
//       console.log("3 " + error);
//       reject();
//     }
//   });
// };

module.exports = Follow;
