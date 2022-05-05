import React, { Component, useEffect } from "react";
import TripService from "../TripService/emitter";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { CardActionArea } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import "../../styles/CostEstimation.css";
import car1 from '../../images/car1.png'
import car2 from '../../images/car2.png'
import car3 from '../../images/car3.png'

const BASE_FEE = 2.0;
const BOOKING_FEE = 2.5;
const TIME_FEE = 0.4;
const RIDE_DISTANCE = 0.5;
const MINIMUM_FARE = 16.0;
const COMFORT_FEE = 8.0;
const COMFORT_RATE = 1.35;
const POOL_FEE = 5.0;

let tripEstimateData = {};
let costType_UberX = 0;
let costType_Comfort = 0;
let costType_Pool = 0;

function chooseUberX() {
  let data = {
    rideType: "UberX",
    cost: costType_UberX,
  };
  TripService.emit("chooseRideType", data);
  //console.log(data);
}

function chooseComfort() {
  let data = {
    rideType: "Comfort",
    cost: costType_Comfort,
  };
  TripService.emit("chooseRideType", data);
  //console.log(data);
}

function choosePool() {
  let data = {
    rideType: "Pool",
    cost: costType_Pool,
  };
  TripService.emit("chooseRideType", data);
  //console.log(data);
}

function checkPrice(price) {
  if (price <= MINIMUM_FARE) {
    price = MINIMUM_FARE;
    return price;
  } else {
    return price;
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tripDuration: "",
      tripDistance: "",
      uberX_Text: "",
      comfort_Text: "",
      pool_Text: "",
    };
  }

  tripEstimateData = (data) => {
    tripEstimateData = data.data;
    var tripDuration = Math.floor(tripEstimateData.duration / 60);
    var tripDistance = Math.floor(tripEstimateData.distance / 1000);
    var tripCost =
      tripDuration * TIME_FEE +
      tripDistance * RIDE_DISTANCE +
      BASE_FEE +
      BOOKING_FEE;

    costType_UberX = parseInt(checkPrice(tripCost));
    costType_Comfort = (tripCost + COMFORT_FEE) * COMFORT_RATE;
    costType_Pool = tripCost / 2 + POOL_FEE;

    this.setState({
      tripDuration: `Trip duration: ${tripDuration} minutes`,
      tripDistance: `Trip distance: ${tripDistance} miles`,
      uberX_Text: `UberX: $${costType_UberX.toFixed(2)}`,
      comfort_Text: `Comfort: $${costType_Comfort.toFixed(2)}`,
      pool_Text: `Pool: $${costType_Pool.toFixed(2)}`,
    });
  }

  componentDidMount = () => {
    TripService.on("tripEstimateData", this.tripEstimateData);
  };

  componentWillUnmount = () => {
    TripService.off("tripEstimateData", this.tripEstimateData);
  }

  render = () => {
    return (
      <div className="costEst">
        <FormControl id="chooseRide">
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="uberX"
            name="radio-buttons-group"
          >
            <Card value="uberX" onClick={chooseUberX}>
              <CardActionArea>
                <CardContent>
                  <FormControlLabel
                    value="uberX"
                    control={<Radio />}
                    label={this.state.uberX_Text}
                  />
                  <img src={car1} alt="car1" 
                  style={{width: 250, top: this.props.top, left: this.props.left}}/>
                </CardContent>
              </CardActionArea>
            </Card>
            
            <Card value="confort" onClick={chooseComfort}>
              <CardActionArea>
                <CardContent>
                  <FormControlLabel
                    value="comfort"
                    control={<Radio />}
                    label={this.state.comfort_Text}
                  />
                  <img src={car3} alt="car3" 
                  style={{width: 250, top: this.props.top, left: this.props.left}}/>
                  <p id="caption">Newer cars with extra legroom</p>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card value="pool" onClick={choosePool}>
              <CardActionArea>
                <CardContent>
                  <FormControlLabel
                    value="pool"
                    control={<Radio />}
                    label={this.state.pool_Text}
                  />
                  <img src={car2} alt="car2" 
                  style={{width: 250, top: this.props.top, left: this.props.left}}/>
                  <p id="caption">Share the ride with 1 to 3 people</p>
                </CardContent>
              </CardActionArea>
            </Card>
          </RadioGroup>
        </FormControl>
      </div>
    );
  };
}

export default App;
