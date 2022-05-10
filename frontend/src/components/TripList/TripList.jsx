import { useEffect, useState } from "react"
import Trip from "./Trip"
import axios from "axios"
import * as Constants from "../../constants.js"

const TripList = ({ trips, user }) => {
  const [tripList, setTripList] = useState([])

  useEffect(() => {
    trips.sort((a,b) => a._id < b._id)
    trips.forEach( (t) =>{
      axios.post(Constants.AUTHENTICATION_SERVER + "/trip", { data: t}).then((res) => {
        console.log(res.data.trip)
        const trip = res.data.trip
        const otherID = (user._id === trip.riderId) ? trip.driverId : user._id
        const other = (user._id === trip.riderId) ? trip.driverName : trip.riderName
        axios.post(Constants.AUTHENTICATION_SERVER + "/user", { data: otherID}).then((res) => {
          console.log(res.data)
          const otherRating = 0
          const newTrip = <Trip key={otherID} user={user} trip={trip} other={other} otherID={otherID} otherRating={otherRating} wasRider={user._id===trip.riderId}/>
        setTripList((list) => [...list, newTrip])
        })
      })
    })
  }, [])

  return (
    <div>
      <h1>Trips</h1>
      {tripList}
    </div>
  )
}

export default TripList
