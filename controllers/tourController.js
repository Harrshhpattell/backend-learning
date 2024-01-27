// const fs = require("fs");
const Tour = require("./../models/tourModel");

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Invalid Id",
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    // 1A) FITERING
    const queryObj = { ...req.query };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) ADVANCE FITERING
    // {difficulty: 'easy, duration: { $gte: 5}}
    // api : 127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy [output: {difficulty: 'easy, duration: { gte: 5}}]
    // we want { $gte: 5} but it get { gte: 5 } so we replace
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    console.log(req.query);
    let query = Tour.find(JSON.parse(queryStr));

    // const query = Tour.find({
    //   duration: 5,
    //   difficulty: "easy",
    // });

    //******another way******
    // const query = await Tour.find()
    //   .where("duration")
    //   .equals(5) // we can also use lt,lte
    //   .where("difficulty")
    //   .equals("easy");

    // 2) sorting
    if (req.query.sort) {
      // query = query.sort(req.query.sort);

      // if both price same then we can sort another criteria
      // sort('price ratingsAverage')

      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      // query = query.select('name duration price')
      query = query.select(fields);
    } else {
      query = query.select("-__v");
      // '-' means excluding fields
    }

    // 4) Pagination
    // page=2&limit=10 ===>> 1-10 (page-1), 11-20 (page-2), 21-30 (page-3)
    // query = query.skip(10).limit(10);
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    console.log(page);
    console.log(limit);
    console.log(skip);

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("This page does not exist");
    }

    const tours = await query;

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({_id:req.params.id})
    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// exports.createTour = (req, res) => {
//   console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/data/tours-simple.json`,
//     JSON.stringify(tours),
//     (err) => {
//       res.status(201).json({
//         status: "success",
//         data: {
//           tour: newTour,
//         },
//       });
//     }
//   );
// };

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "invalid data sent!!",
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      message: "deleted",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
