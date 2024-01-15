const fs = require("fs");
const express = require("express");
const { ok } = require("assert");

const app = express();
app.use(express.json());

// app.get("/", (req, res) => {
//   res
//     .status(200)
//     .json({ message: "hello from the server side", app: "Natours" });
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`)
);

app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

app.get("/api/v1/tours/:id", (req, res) => {
  //   console.log(req.params);

  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  //   if (tours.length < id) {
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
});

app.post("/api/v1/tours", (req, res) => {
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
});

app.patch("/api/v1/tours/:id", (req, res) => {
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
});

app.delete("/api/v1/tours/:id", (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}....`);
});

// powershall
// Get-ExecutionPolicy
// Set-ExecutionPolicy RemoteSigned

// after work
// Set-ExecutionPolicy Restricted

// 200- ok
// 201- created
// 404- Not Found
// 204- no content
