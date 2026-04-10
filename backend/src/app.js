require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");

const authRoutes = require("./features/auth/auth.routes");
const usersRoutes = require("./features/users/users.routes");
const classesRoutes = require("./features/classes/classes.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/classes", classesRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
