var express = require('express');
var router = express.Router();
const { generateToken, isRay } = require('../utils/auth');
const { connectToDB, ObjectId } = require('../utils/db');


/* GET users listing. */
router.get('/', isRay, function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/admins', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("admins").aggregate([
      {
        $lookup: {
          from: "volunteer",
          localField: "_id",
          foreignField: "admin",
          as: "admins"
        }
      },
      // remove the ip_address field
      //{ $project: { ip_address: 0 } }
    ]).toArray();
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
  finally {
    await db.client.close();
  }
});

router.get('/users', async function (req, res) {
    const db = await connectToDB();
    try {
      let result = await db.collection("volunteer").aggregate([
        {
          $lookup: {
            from: "volunteer",
            localField: "_id",
            foreignField: "user",
            as: "volunteers"
          }
        },
        // remove the ip_address field
        //{ $project: { ip_address: 0 } }
      ]).toArray();
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
    finally {
      await db.client.close();
    }
  });

module.exports = router;
