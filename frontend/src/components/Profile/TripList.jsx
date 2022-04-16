import { useEffect, useState } from "react"
import Trip from "./Trip"

export default ({ trips }) => {
  const [tripList, setTripList] = useState(null)

  useEffect(() => {
    const myTrips = trips.map(trip =>
      <li key={trip.clientID}>
        <Trip trip={trip} />
      </li>)
    setTripList(myTrips)
  }, [])

  return (
    <div>
      <h1>Trips</h1>
      {tripList}
    </div>
  )
}