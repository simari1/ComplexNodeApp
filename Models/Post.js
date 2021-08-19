const postsCollection = require("../Utils/db")
  .db("ComplexApp")
  .collection("post");
const ObjectID = require("mongodb").ObjectID;
const User = require("./User");
const sanitizeHtml = require("sanitize-html");

let Post = function (data, userid, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title = "";
  }
  if (typeof this.data.body != "string") {
    this.data.body = "";
  }

  // get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: sanitizeHtml(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: [],
    }),
    createdDate: new Date(),
    author: ObjectID(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title.");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide post content.");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      // save post into database
      try {
        postsCollection
          .insertOne(this.data)
          .then((info) => {
            console.log("info.insertedId", info.insertedId);
            resolve(info.insertedId);
          })
          .catch(() => {
            this.errors.push("Please try again later.");
            reject(this.errors);
          });
      } catch (error) {
        console.log("", error);
        reject(this.errors);
      }
    } else {
      reject(this.errors);
    }
  });
};

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSinglePostById(
        this.requestedPostId,
        this.userid
      );
      if (post.isVisitorOwner) {
        let status;
        try {
          status = await this.actuallyUpdate();
        } catch (error) {
          console.log(error);
          throw error;
        }
        resolve(status);
      } else {
        reject();
      }
    } catch (error) {
      reject();
    }
  });
};

Post.reusablePostQuery = function (
  uniqueOperations,
  visitorId,
  finalOperations = []
) {
  return new Promise(async function (resolve, reject) {
    try {
      let aggOperations = uniqueOperations
        .concat([
          {
            $lookup: {
              from: "user",
              localField: "author",
              foreignField: "_id",
              as: "authorDocument",
            },
          },
          {
            $project: {
              title: 1,
              body: 1,
              createdDate: 1,
              authorId: "$author",
              author: { $arrayElemAt: ["$authorDocument", 0] },
            },
          },
          { $sort: { createdDate: -1 } },
        ])
        .concat(finalOperations);
      let posts = await postsCollection.aggregate(aggOperations).toArray();
      // clean up author property in each post object
      posts = posts.map(function (post) {
        post.isVisitorOwner = post.authorId.equals(visitorId);
        post.author = {
          username: post.author.username,
          avatar: new User(post.author, true).avatar,
        };
        return post;
      });

      resolve(posts);
    } catch (error) {
      reject();
      console.log("err", error);
    }
  });
};

Post.findSinglePostById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findPostsByAuthorId = function (authorId) {
  return Post.reusablePostQuery([{ $match: { author: authorId } }]);
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      await postsCollection.findOneAndUpdate(
        {
          _id: new ObjectID(this.requestedPostId),
        },
        {
          $set: { title: this.data.title, body: this.data.body },
        }
      );
      resolve("success");
    } else {
      resolve("failure");
    }
  });
};

Post.delete = function (postIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post;
      try {
        post = await Post.findSinglePostById(postIdToDelete, currentUserId);
      } catch (error) {
        console.log(error);
      }

      if (post.isVisitorOwner) {
        postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) });
        resolve();
      } else {
        reject();
      }
    } catch (error) {
      reject();
    }
  });
};

Post.search = function (searchTerm) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof searchTerm == "string") {
        // let posts = await Post.reusablePostQuery(
        //   // [{ $match: { $text: { $search: searchTerm } } }],
        //   [
        //     { $match: { body: searchTerm } },
        //     { $sort: { score: { $meta: "textScore" } } },
        //   ],
        //   undefined
        //   // [{ $sort: { score: { $meta: "textScore" } } }]
        // );
        console.log("2" + searchTerm);
        let posts = postsCollection.find({
          body: "/" + searchTerm + "/",
        });
        console.log("3" + posts);
        resolve(posts);
      } else {
        reject();
      }
      resolve();
    } catch (error) {
      console.log(error);
      reject();
    }
  });
};

module.exports = Post;
