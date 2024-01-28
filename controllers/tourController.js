// const fs = require("fs");
const Tour = require("./../models/tourModel");
const APIFeatures = require("./../utils/apiFeatures");

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    // 1A) FITERING

    // const queryObj = { ...req.query };
    // const excludedFields = ["page", "sort", "limit", "fields"];
    // excludedFields.forEach((el) => delete queryObj[el]);

    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // console.log(req.query);
    // let query = Tour.find(JSON.parse(queryStr));

    // 2) sorting

    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(",").join(" ");
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort("-createdAt");
    // }

    // 3) Field limiting

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(",").join(" ");

    //   query = query.select(fields);
    // } else {
    //   query = query.select("-__v");

    // }

    // 4) Pagination

    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // console.log(page);
    // console.log(limit);
    // console.log(skip);

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error("This page does not exist");
    // }

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query;

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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: null
          // _id: "$difficulty",
          // _id: "$ratingsAverage",
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRating: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 }, //accending
      },
      // {
      //   $match: { _id: { $ne: "EASY" } },
      // },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0, // hide id
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        // $limit: 6
      },
    ]);

    res.status(200).json({
      status: "success",
      number: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
