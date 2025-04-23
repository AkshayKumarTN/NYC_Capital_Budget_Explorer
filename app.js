//Here is where you'll set up your server as shown in lecture code
import dotenv from "dotenv";
import express from "express";
import { engine } from "express-handlebars";
import configRoutes from "./routes/index.js";
import { requireLogin, idleTime } from "./middlewares/auth.js";
import session from "express-session";
import { unless } from "express-unless";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.SESSION_SECRET || "default Secret Key";

app.use(
  session({
    name: "NYC_Capital_Budget_Explorer",
    secret,
    resave: false,
    saveUninitialized: false,
    //Init Cookie if needed.
  })
);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Session Middlewares
app.use(idleTime);

const publicPaths = ["/", "/login", "/signup", "/forgot-password"];
requireLogin.unless = unless;

app.use(requireLogin.unless({ path: publicPaths }));

configRoutes(app);

app.listen(port, () => {
  console.log(`Your routes will be running on http://localhost:${port}`);
});
