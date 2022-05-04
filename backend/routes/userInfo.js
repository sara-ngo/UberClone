import express from 'express';
import jwt from 'jsonwebtoken'
var router = express.Router();
import {
  User,
  validate
}
from "../../models/user.js";

router.post("/", (req, res) => {
  if(!req.body.data){
    res.send({errorMessage:"Invalid Token"})
    return;
  }
  const item = jwt.decode(req.body.data);
  if(!item._id){
    res.send({errorMessage:"Invalid Decoded Token"})
    return;
  }
  User.findById(item._id, (err, user) => {
    res.send({newUser:user})
  })
});

export default router;
