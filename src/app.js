
const express = require("express");
const morgan = require('morgan')
const exphbs = require("express-handlebars");
const path = require("path");
const session = require("express-session");

const app = express();



//Cookie
const TWO_HOURS = 1000 * 60 * 60 * 2;
const IN_PROD = "development" === "production";
const SESS_SECRET = "ssh!quiet,it'asecret!";

app.use(
  session({
    name: "sid",
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
      maxAge: TWO_HOURS,
      sameSite: true, 
      secure: IN_PROD,
    },
  })
);

// settings
app.set("port", process.env.PORT || 3030);
//middlewares

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(require("./routes/routes"));

// li diem al node on es troben els views

app.set("views", path.join(__dirname, "views"));

// motor de templating (hbs)

app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: __dirname + "/views/layouts", // ubicació dels parcials
  })
);

app.set("view engine", ".hbs");

// routes

// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// urlencode -> extended true -> enten objectes i en general qualsevol tipus de dada (el request)
// urlencode extended és false -> enten strings i arrays

app.use(require("./routes/routes"));

// altres fitxers ( assets )

app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
