const express = require("express");
const app = express();
app.use(express.json());
const {
  models: { User, Note },
} = require("./db");
const path = require("path");

const requireToken = async (req, res, next) => {
  try {
    const authUser = await User.byToken(req.headers.authorization);
    req.user = authUser;
    next();
  } catch (ex) {
    next(ex);
  }
};

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.get("/api/users/notes", requireToken, async (req, res, next) => {
  try {
    const notes = await Note.findAll({
      where: {
        id: req.user.id,
      },
    });
    res.json(notes);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

//already logged in
app.get("/api/auth", requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/auth", async (req, res, next) => {
  try {
    res.send();
  } catch (ex) {
    next(ex);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
