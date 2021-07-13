const express = require("express");
const router = express.Router();

const {
    createContest,
    getContestById,
    getContests,
    updateContestById
} = require("../controllers/contest");

// CREATE
router.route("/create").post(createContest);

// READ
router.route("/:id").get(getContestById);
router.route("/").get(getContests);

// UPDATE
router.route("/:id").patch(updateContestById);

module.exports = router;