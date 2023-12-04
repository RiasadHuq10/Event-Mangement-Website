var express = require('express');
var router = express.Router();
var passport = require('passport');

const { connectToDB, ObjectId } = require('../utils/db');
const { isVol,isAdmin,generateToken } = require('../utils/auth');

// routes
router.get('/', async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};
        if (req.query.event) {
            query.event = { $regex: req.query.event };
        }
        if(req.query.highlight)
        {
            query.highlight = true;
        }
        
        


        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 6;
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

        let result = await db.collection("event").find(query).sort(sort).skip(skip).limit(perPage).toArray();

        let total = await db.collection("event").countDocuments(query);

        res.json({ events: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});


//New Event
router.post('/',passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.quota = parseInt(req.body.quota);
        req.body.createdAt = new Date();
        req.body.modifiedAt = new Date();

        let result = await db.collection("event").insertOne(req.body);

        res.status(201).json({ message: "Event Created" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

/* Retrieve a single Event */
router.get('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("event").findOne({ _id: new ObjectId(req.params.id) });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Update a single event
router.put('/:id',passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        delete req.body._id
        req.body.quota = parseInt(req.body.quota);
        req.body.modifiedAt = new Date();

        let result = await db.collection("event").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });


        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Event updated" });
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Delete a single event
router.delete('/:id',passport.authenticate('bearer', { session: false }),isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("event").deleteOne({ _id: new ObjectId(req.params.id) });
        let volEventResult = await db.collection("volEvent").deleteMany({ eventID: new ObjectId(req.params.id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Event deleted" });
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


// Specify events being managed by an admin
router.patch('/:id/manage', passport.authenticate('bearer', { session: false }), async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("event").updateOne({ _id: new ObjectId(req.params.id) },
            {
                $set: { manager: new ObjectId(req.user._id) }
            });

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Event updated" });
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});



module.exports = router;