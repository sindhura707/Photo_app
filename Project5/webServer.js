/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

app.use(bodyParser.json());
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const mimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  if (mimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only jpeg, jpg, png and gif image files are allowed."));
    return null;
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: fileFilter,
}).single("uploadedphoto");

const fileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      err.status = 400;
      next(err);
    } else {
      next();
    }
  });
};

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

function formatComments(array) {
  return array.map((item) => {
    const newItem = { ...item };
    if (newItem.comments.length > 0) {
      newItem.comments = newItem.comments.map((comment) => {
        const newComment = { ...comment };
        newComment.user = { ...newComment.user_id };
        delete newComment.user_id;
        return newComment;
      });
    }
    return newItem;
  });
}

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 *
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */

app.post("/admin/login", async function (request, response) {
  const { login_name, password } = request.body;
  const user = await User.findOne({ login_name, password });
  if (!user) {
    response.status(400).send("Invalid login");
    return;
  }
  request.session.user = user;
  response.status(200).send({ first_name: user.first_name, last_name: user.last_name, occupation: user.occupation, description: user.description, location: user.location, _id: user._id });
});

app.post("/admin/logout", function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
    return;
  }
  request.session.destroy();
  response.status(200).send("Logged out successfully");
});

app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    console.log("/test called with param1 = ", request.params.p1);

    const param = request.params.p1 || "info";

    if (param === "info") {
      // Fetch the SchemaInfo. There should only one of them. The query of {} will
      // match it.
      SchemaInfo.find({}, function (err, info) {
        if (err) {
          // Query returned an error. We pass it back to the browser with an
          // Internal Service Error (500) error code.
          console.error("Error in /user/info:", err);
          response.status(500).send(JSON.stringify(err));
          return;
        }
        if (info.length === 0) {
          // Query didn't return an error but didn't find the SchemaInfo object -
          // This is also an internal error return.
          response.status(500).send("Missing SchemaInfo");
          return;
        }

        // We got the object - return it in JSON format.
        console.log("SchemaInfo", info[0]);
        response.end(JSON.stringify(info[0]));
      });
    } else if (param === "counts") {
      // In order to return the counts of all the collections we need to do an
      // async call to each collections. That is tricky to do so we use the async
      // package do the work. We put the collections into array and use async.each
      // to do each .count() query.
      const collections = [
        { name: "user", collection: User },
        { name: "photo", collection: Photo },
        { name: "schemaInfo", collection: SchemaInfo },
      ];
      async.each(
        collections,
        function (col, done_callback) {
          col.collection.countDocuments({}, function (err, count) {
            col.count = count;
            done_callback(err);
          });
        },
        function (err) {
          if (err) {
            response.status(500).send(JSON.stringify(err));
          } else {
            const obj = {};
            for (let i = 0; i < collections.length; i++) {
              obj[collections[i].name] = collections[i].count;
            }
            response.end(JSON.stringify(obj));
          }
        }
      );
    } else {
      // If we know understand the parameter we return a (Bad Parameter) (400)
      // status.
      response.status(400).send("Bad param " + param);
    }
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    const userList = await User.find({}, { __v: 0, location: 0, description: 0, occupation: 0, login_name: 0, password: 0 }).lean();
    // response.status(200).send(models.userListModel());
    response.status(200).send(userList);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const id = request.params.id;
      const user = await User.findById(id, { __v: 0, login_name: 0, password: 0 });
      if (user === null) {
        console.log("User with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      response.status(200).send(user);
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const id = request.params.id;
      Photo.createIndexes({ user_id: 1, liked_by: -1, date_time: -1 });
      const photos = await Photo.find({ user_id: id }, { __v: 0 })
        .populate({
          path: "comments.user_id",
          model: "User",
          select: "-location -description -occupation -login_name -password -__v",
        })
        .sort({ liked_by: -1, date_time: -1 })
        .lean();

      if (photos.length === 0) {
        console.log("Photos for user with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }

      const formattedComments = formatComments(photos);
      response.status(200).send(formattedComments);
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

app.post("/commentsOfPhoto/:photo_id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const { comment } = request.body;
      const photo_id = request.params.photo_id;
      const photo = await Photo.findById(photo_id);
      if (!photo) {
        response.status(400).send("Photo not found");
        return;
      }
      if (!comment) {
        response.status(400).send("Comment is required");
        return;
      }
      photo.comments.push({
        comment,
        date_time: new Date(),
        user_id: request.session.user._id,
      });
      await photo.save();
      const newComment = photo.toObject().comments[photo.comments.length - 1];
      response.status(200).send({
        comment: newComment.comment,
        date_time: newComment.date_time,
        user: {
          first_name: request.session.user.first_name,
          last_name: request.session.user.last_name,
          occupation: request.session.user.occupation,
          description: request.session.user.description,
          location: request.session.user.location,
          _id: request.session.user._id,
        },
      });
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

app.post("/user", async function (request, response) {
  const { first_name, last_name, location, description, occupation, login_name, password } = request.body;
  if (!first_name || !last_name || !location || !description || !occupation || !login_name || !password) {
    response.status(400).send("All fields are required");
    return;
  }
  try {
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      response.status(400).send("User already exists");
      return;
    }
    const user = new User({
      first_name,
      last_name,
      location,
      description,
      occupation,
      login_name,
      password,
    });
    await user.save();
    response.status(200).send(user);
  } catch (error) {
    response.status(400).send("Invalid data");
  }
});

app.post("/photos/new", fileUpload, async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const photo = new Photo({
        file_name: request.file.filename,
        date_time: new Date(),
        user_id: request.session.user._id,
        comments: [],
      });
      await photo.save();
      response.status(200).send(photo);
    } catch (error) {
      response.status(400).send("Invalid data");
    }
  }
});

app.get("/photos/latest/:id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const id = request.params.id;
      const photo = await Photo.find({ user_id: id }, { __v: 0 }).sort({ date_time: -1 }).limit(1).lean();
      if (photo.length === 0) {
        console.log("Photos for user with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      response.status(200).send(photo[0]);
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

app.get("/photos/most-comments/:id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const id = request.params.id;
      // const photo = await Photo.find({ user_id: id }, { __v: 0 }).sort({ "comments.length": -1 }).limit(1).lean();
      const photo = await Photo.aggregate([
        {
          $match: {
            user_id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $addFields: {
            comment_length: {
              $size: { $ifNull: ["$comments", []] },
            },
          },
        },
        { $sort: { comment_length: -1 } },
        { $limit: 1 },
      ]);

      if (photo.length === 0) {
        console.log("Photos for user with _id:" + id + " not found.");
        response.status(400).send("Not found");
        return;
      }
      response.status(200).send(photo[0]);
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

app.post("/photos/like/:photo_id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const photo_id = request.params.photo_id;
      const photo = await Photo.findById(photo_id);
      if (!photo) {
        response.status(400).send("Photo not found");
        return;
      } else if (photo.liked_by.includes(request.session.user._id)) {
        photo.liked_by = photo.liked_by.filter((id) => id.toString() !== request.session.user._id.toString());
        await photo.save();
        response.status(200).send(photo.liked_by);
      } else {
        photo.liked_by.push(request.session.user._id);
        await photo.save();
        response.status(200).send(photo.liked_by);
      }
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

app.post("/photos/favorite/:photo_id", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const photo_id = request.params.photo_id;
      const photo = await Photo.findById(photo_id);
      if (!photo) {
        response.status(400).send("Photo not found");
        return;
      } else if (photo.favorited_by.includes(request.session.user._id)) {
        photo.favorited_by = photo.favorited_by.filter((id) => id.toString() !== request.session.user._id.toString());
        await photo.save();
        response.status(200).send(photo.favorited_by);
      } else {
        photo.favorited_by.push(request.session.user._id);
        await photo.save();
        response.status(200).send(photo.favorited_by);
      }
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

app.get("/photos/favorites", async function (request, response) {
  if (!request.session.user) {
    response.status(401).send("You are not logged in");
  } else {
    try {
      const photos = await Photo.find({ favorited_by: request.session.user._id }, { __v: 0 })
        .populate({
          path: "user_id",
          model: "User",
          select: "_id first_name last_name",
        })
        .lean();
      response.status(200).send(photos);
    } catch (error) {
      response.status(400).send("Invalid id");
    }
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log("Listening at http://localhost:" + port + " exporting the directory " + __dirname);
});
