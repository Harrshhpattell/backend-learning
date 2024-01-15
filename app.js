const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const { ok } = require("assert");

const app = express();
// 1) middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log("hello from the middleware");
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use(morgan("dev"));

// 2) Route Handlers

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid Id",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid Id",
    });
  }
  res.status(200).json({
    status: "success",
    message: "updated",
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid Id",
    });
  }
  res.status(204).json({
    status: "success",
    message: "deleted",
    data: null,
  });
};

// -----------------------------

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined!",
  });
};

const creatUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined!",
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined!",
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined!",
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined!",
  });
};

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`)
);

// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getTour);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

// 3) Route

app.route("/api/v1/tours").get(getAllTours).post(createTour);
app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route("/api/v1/users").get(getAllUsers).post(creatUser);
app
  .route("/api/v1/users/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

//   4) Server

const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}....`);
});
