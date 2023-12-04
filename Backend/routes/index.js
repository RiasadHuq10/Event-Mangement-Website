var express = require('express');
var router = express.Router();

const { generateToken } = require('../utils/auth');


const { connectToDB, ObjectId } = require('../utils/db');

/* GET home page. */
router.get('/', async function (req, res, next) {

  const db = await connectToDB();
  try {
    let count = parseInt(req.query.count) || 3
    let results = await db.collection("event").find({}).limit(count).sort({ modifiedAt: -1 }).toArray();

    res.render('homepage', { events: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Handle the volunteer */
router.post('/volunteer', async function (req, res) {
  const db = await connectToDB();
  try {

    req.body.terms = req.body.terms == "on";
    req.body.createdAt = new Date();
    req.body.modifiedAt = new Date();

    let result = await db.collection("volunteer").insertOne(req.body);
    res.render('successful');
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Handle the Event */
router.post('/event', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.quota = parseInt(req.body.quota);
    req.body.createdAt = new Date();
    req.body.modifiedAt = new Date();

    let result = await db.collection("event").insertOne(req.body);
    res.render('successful');
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// display the update form
router.get('/event/editEvent/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("event").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('editEvent', { event: result });
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
router.post('/event/editEvent/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.quota = parseInt(req.body.quota);
    req.body.modifiedAt = new Date();

    let result = await db.collection("event").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

    if (result.modifiedCount > 0) {
      res.render('successful');
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
router.post('/event/delete/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("event").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount > 0) {
      res.render('successful');
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// display the volunteer form
router.get('/displayVolunteer', async function (req, res) {

  try {

    res.render('volunteer');

  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {

  }
});

// display the homepage form
router.get('/Home', async function (req, res) {

  const db = await connectToDB();
  try {
    let count = parseInt(req.query.count) || 3
    let results = await db.collection("event").find({}).limit(count).sort({ modifiedAt: -1 }).toArray();

    res.render('homepage', { events: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// display new event
router.get('/newevent', async function (req, res) {

  try {

    res.render('newEvent');

  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {

  }
});

/* Display all events */
router.get('/events', async function (req, res) {
  const db = await connectToDB();
  try {
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 6;
    let skip = (page - 1) * perPage;
    let result = await db.collection("event").find().skip(skip).limit(perPage).sort({ modifiedAt: -1 }).toArray();
    let total = await db.collection("event").countDocuments();

    res.render('events', { events: result, total: total, page: page, perPage: perPage });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});


//display single event
router.get('/event/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("event").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('event', { event: result });
    } else {
      res.status(404).json({ message: "event" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

router.post('/api/login', async function (req, res, next) {
  const db = await connectToDB();
  try {
    // check if the user exists
    var user = await db.collection("volunteer").findOne({ email: req.body.email, password: req.body.password });

    if (!user) {
      res.status(401).json({ message: 'Incorrect email or password' });
      return;
    }

    // res.json(user);

    delete user.password;
    // delete user.ip_address;
    // delete admin.password;
    // delete admin.ip_address;
    const token = generateToken(user);;
    // generate a JWT token
    


    // return the token
    res.json({ token: token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});









module.exports = router;
