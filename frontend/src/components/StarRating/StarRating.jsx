import React, { useState } from "react"
import { FaStar } from "react-icons/fa"
import axios from "axios"
import "./StarRating.module.css"

function StarRating({ id, rateUser }) {
  const [rating, setRating] = useState(null)
  const [hover, setHover] = useState(null)

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
                rateUser(ratingValue)
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
