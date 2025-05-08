//Here is where you'll set up your server as shown in lecture code
import dotenv from "dotenv";
import express from "express";
import { engine } from "express-handlebars";
import configRoutes from "./routes/index.js";
import { requireLogin, idleTime } from "./middlewares/auth.js";
import session from "express-session";
import { logRequest } from "./middlewares/common.js";

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

app.use("/public", express.static("public"));
app.engine('handlebars', engine({
  helpers: {
    eq: (a, b) => a === b,
    range: function (from, to) {
      const rangeArray = [];
      for (let i = from; i <= to; i++) {
        rangeArray.push(i);
      }
      return rangeArray;
    }
  }
}));

app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logRequest);

//Session Middlewares
app.use(idleTime);

app.use(requireLogin);

configRoutes(app);

app.listen(port, () => {
  console.log(`Your routes will be running on http://localhost:${port}`);
});
