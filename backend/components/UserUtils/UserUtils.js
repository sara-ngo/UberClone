import jwt from 'jsonwebtoken'
import {
  User,
  validate
}
from "../../../models/user.js";

class App {
  static async getUserInfoByTokenId(tokenId){
    const item = jwt.decode(tokenId);
    if(!item){
      return false;
    }
    const doc = User.findById(item._id);
    return doc;
  }
}

export default App;
