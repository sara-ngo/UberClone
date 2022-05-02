import { v4 as uuid } from 'uuid';

class App {
  static generateTripId(tripMap){
    while(true){
      const tripId = uuid();
      let tripObjRef = tripMap.get(tripId);
      if(!tripObjRef){
        return tripId;
      }
    }
    return false;
  }
}

export default App;
