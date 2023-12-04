var express = require('express');
var router = express.Router();
var passport = require('passport');
const { generateToken, isVol, isAdmin,isUser } = require('../utils/auth');
const { token } = require('morgan');
const { connectToDB, ObjectId } = require('../utils/db');


router.get('/',passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {type:'volunteer'};
        if (req.query.email) {
            query.email = { $regex: req.query.email };
        }
        if (req.query.password) {
            query.password = { $regex: req.query.password };
        }
        if (req.query.name) {
            query.name = { $regex: req.query.name };
        }
        if (req.query.contact) {
            query.contact = parseInt(req.query.contact);
        }
        if (req.query.type) {
            query.type =  { $regex: req.query.type };
        }


        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;

        // sort by sort_by query parameter
        let sort = {};
        if (req.query.sort_by) {

            // split the sort_by into an array
            let sortBy = req.query.sort_by.split(".");

            // check if the first element is a valid field
            if (sortBy.length > 1 && ["modifiedAt"].includes(sortBy[0])) {
                sort[sortBy[0]] = sortBy[1] == "desc" ? -1 : 1;
            }
        }

        let result = await db.collection("volunteer").find(query).sort(sort).skip(skip).limit(perPage).toArray();

        let total = await db.collection("volunteer").countDocuments(query);

        res.json({ volunteers: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});


//New Volunteer
router.post('/', async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.terms = req.body.terms == "on";
        req.body.contact = parseInt(req.body.contact);
        req.body.createdAt = new Date();
        req.body.modifiedAt = new Date();
        req.body.type = 'volunteer'
        let result = await db.collection("volunteer").insertOne(req.body);
        
        res.status(201).json({ message: "Volunteer Created" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

/* Retrieve a single Volunteer */
router.get('/:id', passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("volunteer").findOne({ _id: new ObjectId(req.params.id) });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: "Volunteer not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

router.get('/get/Myself',passport.authenticate('bearer', { session: false }),isVol, async function (req, res) {
    const db = await connectToDB();
    try {
        
        let result = await db.collection("volunteer").findOne({ _id: new ObjectId(req.user._id) });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: "Volunteer not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Update a single volunteer
router.put('/:id',passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        delete req.body._id
        req.body.modifiedAt = new Date();

        let result = await db.collection("volunteer").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });


        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Volunteer updated" });
        } else {
            res.status(404).json({ message: "Volunteer not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});
router.put('/update/Myself',passport.authenticate('bearer', { session: false }),isVol, async function (req, res){
    const db = await connectToDB();
    try {
        delete req.body._id
        req.body.modifiedAt = new Date();

        let result = await db.collection("volunteer").updateOne({ _id: new ObjectId(req.user._id) }, { $set: req.body });


        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Updated" });
        } else {
            res.status(404).json({ message: "Volunteer not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Delete a single volunteer
router.delete('/:id',passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("volunteer").deleteOne({ _id: new ObjectId(req.params.id) });
        let volEventResult = await db.collection("volEvent").deleteMany({ volunteerID: new ObjectId(req.params.id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Volunteer deleted" });
        } else {
            res.status(404).json({ message: "Volunteer not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});




module.exports = router;