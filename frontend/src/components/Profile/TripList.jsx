import { useEffect, useState } from "react"
import Trip from "./Trip"
import axios from "axios"

const TripList = ({ trips, user }) => {
  const [tripList, setTripList] = useState([])

  useEffect(() => {
    trips.sort((a,b) => a._id < b._id)
    trips.forEach( (t) =>{
      axios.post("http://localhost:5000/trip", { data: t}).then((res) => {
        //console.log(res.data.trip)
        const trip = res.data.trip
        const otherID = (user._id === trip.riderID) ? trip.driverID : user._id
        const other = (user._id === trip.riderID) ? trip.driver : trip.rider
        axios.post('http://localhost:5000/user', { data: otherID}).then((res) => {
          const otherRating = res.data.user.rating
          const newTrip = <Trip key={otherID} user={user} trip={trip} other={other} otherID={otherID} otherRating={otherRating} wasRider={user._id===trip.riderID}/>
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