import StarRating from "./StarRating"
import { useEffect, useState } from "react"
import axios from "axios";
import { FaStar } from "react-icons/fa";

export default ({ trip }) => {
  const [clientRating, setClientRating] = useState(null);

  useEffect(() => {
    const url = "http://localhost:5000/user";
    axios.post(url, { data: trip.clientID }).then((res) => {
      setClientRating(res.data.user.rating)
    })

  }, [])
  return (
    <div>
      {(trip.wasRider) ?
        <div>
          {trip.client} drove you
          <div>
            {(clientRating != null) ?
              parseFloat(clientRating).toFixed(1)
              :
              '0'}
            <FaStar size="30px" color="#ffc107" />
          </div>
          <StarRating id={trip.clientID} />
        </div>
        :
        <div>

        </div>}
    </div>
  )
}