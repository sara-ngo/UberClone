import React, { useState } from "react"
import { FaStar } from "react-icons/fa"
import axios from "axios"
import "./StarRating.css"

function StarRating({ id }) {
  const [rating, setRating] = useState(null)
  const [hover, setHover] = useState(null)

  const rateUser = (id, newRating) => {
    axios.post('http://localhost:5000/rate' + id, {
      rating: newRating
    })
  }
  return (
    <div>
      {[...Array(5)].map((star, i) => {
        const ratingValue = i + 1
        return (
          <label key={id + i}>
            <input type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => {
                setRating(ratingValue)
                rateUser(id, ratingValue)
              }}

            />
            <FaStar
              size="30px"
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)} />
          </label>)
      })}
      -Rate!
    </div>
  )
}

export default StarRating