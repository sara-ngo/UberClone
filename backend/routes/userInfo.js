import express from 'express';
import jwt from 'jsonwebtoken'
var router = express.Router();
import {
  User,
  validate
}
from "../../models/user.js";

router.post("/", (req, res) => {
  const item = jwt.decode(req.body.data)
  User.findById(item._id, (err, user) => {
    res.send({newUser:user})
  })
});

export default router;
