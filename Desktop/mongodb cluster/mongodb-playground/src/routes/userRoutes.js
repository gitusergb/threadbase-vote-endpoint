const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/city-stats", async (req, res) => {

  const result = await User.aggregate([
    {
      $group: {
        _id: "$city",
        totalUsers: { $sum: 1 }
      }
    }
  ]);

  res.json(result);
});

module.exports = router;