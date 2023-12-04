var express = require('express');
var router = express.Router();
var passport = require('passport');

const { connectToDB, ObjectId } = require('../utils/db');
const { token } = require('morgan');
const { isVol, isAdmin, generateToken } = require('../utils/auth');

router.get('/', passport.authenticate('bearer', { session: false }), isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};
        if (req.query.eventID) {
            query.eventID = req.query.eventID;
        }
        if (req.query.volunteerID) {
            query.volunteerID = req.query.volunteerID;
        }


        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 6;
        let skip = (page - 1) * perPage;


        let result = await db.collection("volEvent").find(query).skip(skip).limit(perPage).toArray();
        let volunteers = {};
        let events = {};
        let total = 0;
        if (req.query.eventID) {
            volunteers = await db.collection("volEvent").aggregate([
                {
                    $match: {
                        eventID: new ObjectId(req.query.eventID)
                    }
                },
                {
                    $lookup: {
                        from: "volunteer",
                        localField: "volunteerID",
                        foreignField: "_id",
                        as: "volunteers"
                    }
                }]).skip(skip).limit(perPage).toArray();
            let all = await db.collection("volEvent").aggregate([
                {
                    $match: {
                        eventID: new ObjectId(req.query.eventID)
                    }
                },
                {
                    $lookup: {
                        from: "volunteer",
                        localField: "volunteerID",
                        foreignField: "_id",
                        as: "volunteers"
                    }
                }]).toArray();
            total = all.length
        }
        if (req.query.volunteerID) {
            events = await db.collection("volEvent").aggregate([
                {
                    $match: {
                        volunteerID: new ObjectId(req.query.volunteerID)
                    }
                },
                {
                    $lookup: {
                        from: "event",
                        localField: "eventID",
                        foreignField: "_id",
                        as: "events"
                    },
                }]).skip(skip).limit(perPage).toArray();
            let all = await db.collection("volEvent").aggregate([
                {
                    $match: {
                        volunteerID: new ObjectId(req.query.volunteerID)
                    }
                },
                {
                    $lookup: {
                        from: "event",
                        localField: "eventID",
                        foreignField: "_id",
                        as: "events"
                    },
                }]).toArray();
            total = all.length
        }

        //let events = await db.collection("event").find({_id: {$in:result.event}}).toArray();
        //let volunteers = await db.collection("volunteer").find({_id: {$in:result.volunteer}}).toArray();

        res.json({ volEvents: result, volunteers: volunteers, events: events, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});


router.get('/MyEvent', passport.authenticate('bearer', { session: false }), isVol, async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};

        query.volunteerID = req.user._id;

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 3;
        let skip = (page - 1) * perPage;


        let result = await db.collection("volEvent").find(query).toArray();
        //let events = await db.collection("event").find({_id: {$in:result.event}}).toArray();
        let events = await db.collection("volEvent").aggregate([
            {
                $match: {
                    volunteerID: new ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "event",
                    localField: "eventID",
                    foreignField: "_id",
                    as: "events"
                },
            }]).skip(skip).limit(perPage).toArray();

        let allEvents = await db.collection("volEvent").aggregate([
            {
                $match: {
                    volunteerID: new ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: "event",
                    localField: "eventID",
                    foreignField: "_id",
                    as: "events"
                },
            }]).toArray();
        total = allEvents.length

        res.json({ volEvents: result, events: events, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});

//New volEvent
router.post('/:eventID', passport.authenticate('bearer', { session: false }), isVol, async function (req, res) {
    const db = await connectToDB();
    try {
        //token = req.body.token
        req.body.volunteerID = new ObjectId(req.user._id)
        req.body.eventID = new ObjectId(req.params.eventID)
        req.body.createdAt = new Date();
        req.body.modifiedAt = new Date();

        let volEventQuery = {};
        volEventQuery.eventID = req.body.eventID

        let allvolunteers = await db.collection("volEvent").find(volEventQuery).toArray()
        total = allvolunteers.length
        
        volEventQuery.volunteerID = req.body.volunteerID
        let check = await db.collection("volEvent").findOne(volEventQuery);


        


        let event = await db.collection("event").findOne({ _id: new ObjectId(req.params.eventID) });
        let quota = parseInt(event.quota) - total;

        if (!check ) {
            if(quota)
            {let result = await db.collection("volEvent").insertOne(req.body);
            res.status(201).json({ message: "Event Joined" });
            }
            else
            {
                res.status(201).json({ message: "Quota is full" });
            }
        }
        else {
            res.status(201).json({ message: "Already joined this event" });

        }

    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


// Delete a single volEvent
router.delete('/', passport.authenticate('bearer', { session: false }), isAdmin, async function (req, res) {
    const db = await connectToDB();
    try {
        console.log({ eventID: new ObjectId(req.body.eventID), volunteerID: new ObjectId(req.body.volunteerID) })
        // let query = {};
        // query.eventID = req.body.eventID
        // query.volunteerID = req.body.volunteerID
        // let check = await db.collection("volEvent").findOne(query);
        let result = await db.collection("volEvent").findOneAndDelete({ eventID: new ObjectId(req.query.eventID), volunteerID: new ObjectId(req.query.volunteerID) });

        if (result) {
            res.status(200).json({ message: "volEvent deleted" });
        } else {
            res.status(404).json({ message: "volEvent not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


// Get the total number of event per organiser
router.get('/organiser', passport.authenticate('bearer', { session: false }), isVol, async function (req, res) {
    const db = await connectToDB();
    try {
        // let pipelines = [];



        // pipelines = pipelines.concat();
        let result = await db.collection("volEvent").aggregate([
            // non null superhero
            { $match: { volunteerID: new ObjectId(req.user._id) } },
            {
                $lookup: {
                    from: "event",
                    localField: "eventID",
                    foreignField: "_id",
                    as: "events"
                },
            },
            {
                $unwind: {
                    path: "$events"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$events"
                }
            },
            { $group: { _id: "$organiser", total: { $sum: 1 } } }
        ]).toArray();

        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

router.get('/stats/superhero', async function (req, res) {
    const db = await connectToDB();
    try {
        let pipelines = [];

        if (req.query.team) {
            pipelines.push({ $match: { team: req.query.team } });
        }

        pipelines = pipelines.concat([
            // non null superhero
            { $match: { superhero: { $ne: null } } },
            { $group: { _id: "$superhero", total: { $sum: 1 } } }
        ]);

        let result = await db.collection("bookings").aggregate(pipelines).toArray();
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

module.exports = router;