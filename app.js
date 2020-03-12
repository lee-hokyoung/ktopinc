const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const workRouter = require("./routes/work");
const adminRouter = require("./routes/admin");
const noticeRouter = require("./routes/notice");
const testRouter = require("./routes/test");

const connect = require("./model");
const passportConfig = require("./passport");

const app = express();
passportConfig(passport);
connect();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.set("port", process.env.PORT || 3000);

// app.use(logger('dev'));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
// app.use(cookieParser());
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs", express.static(path.join(__dirname, "docs")));
app.use("/docs_closed", express.static(path.join(__dirname, "docs_closed")));
// app.use('/ui-kit', express.static(path.join(__dirname, 'node_modules/now-ui-kit/assets')));
// app.use('/ui-kit', express.static(path.join(__dirname, 'public/assets')));
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/work", workRouter);
app.use("/admin", adminRouter);
app.use("/notice", noticeRouter);
app.use("/test", testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(`${app.get("port")}번 포트에서 대기 중`);
});
