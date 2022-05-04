import StarRating from "../StarRating/StarRating"
import { useEffect, useState } from "react"
import axios from "axios";
import { FaStar } from "react-icons/fa";

const Trip = ({ trip, other, otherRating, otherID, wasRider }) => {
   const [ratingVisible, setRatingVisible] = useState(false);

  useEffect(() => {
    if((wasRider &&  !trip.driverRating) || (!wasRider && !trip.riderRating)){
      setRatingVisible(true)
    }
  }, [])

  const tripInfo = (wasRider) ? `${other} drove you` : `You drove ${other}`

  const rateUser = (newRating) => {
    axios.post('http://localhost:5000/rate', {
      wasRider: wasRider,
      userID: otherID,
      tripID: trip._id,
      rating: newRating,
    })
    setRatingVisible(false)
  }

  return (
    <div>
      {tripInfo}
      <div>
        {parseFloat(otherRating).toFixed(1)}
        <FaStar size="30px" color="#ffc107" />
      </div>
      {ratingVisible && <StarRating id={otherID} rateUser={rateUser}/>}
    </div>
  )
}

export default Trip
