const Submission = require("../models/Submission");
const Contest = require("../models/Contest");
const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');



exports.createSubmission = asyncHandler(async (req, res, next) => {
    const userID = req.user.id;
    const contestID = req.params.id;
    const { imageFiles } = req.body;

    try {
        const contest = await Contest.findById({_id: contestID})
        if (!contest){
            return res.status(404).json({
                status: "contest not found"
            })  
        }
        console.log('Running submission')
        let submission = await Submission.findOneAndUpdate({userID:userID, contestID:contestID},{$addToSet: {imageFiles: { $each: imageFiles } } },{new:true});
        console.log(`Checking for submission: ${submission}`)
        if (!submission){
            console.log('Submission not found creating a new one')
            submission = new Submission({
                contestID: contestID,
                userID: userID,
                imageFiles: imageFiles 
            });
        }

        console.log(`Checking if saved ${submission}`)
        const result = await submission.save();
        if (!result) {
            console.log('Not saved')
            return res.status(400).json({ status: "submission not saved"})
        }
        console.log('Saved')
        return res.status(201).json({
            status: "submission saved",
            submission
        })
        }
    catch (error) {
        return res.status(500).json({status: "error",
        error
        })
    }  
    
})

exports.getSubmission = asyncHandler(async (req, res, next) => {
    const userID = req.user.id;
    const contestID = req.params.id;
    const contest = await Contest.findById({_id: contestID})
    if (!contest){
        return res.status(404).json({
            status: "contest not found"
        })  
    }
    if (contest.userID === userID){
        const submission = await Submission.find({contestID:contestID})
        if (!submission) {
            return res.status(404).json({
                status: "submission not found"
            })
        }
        return res.status(200).json({
            status: "submission found",
            submission: submission
        })
    }
    
    const submission = await Submission.find({contestID: contestID, userID: userID})
    if (!submission) {
        return res.status(404).json({
            status: "submission not found"
        })
    }
    return res.status(200).json({
        status: "submission found",
        submission: submission
    })

})
