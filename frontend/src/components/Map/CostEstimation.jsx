function CostEstimation(){
  return (
    <div id="costEst" className="costEst">
        <p id="tripDuration"></p>
        <p id="tripDistance"></p>
        <p id="title">Estimated cost: </p>
        <ul id="chooseRide">
          <li value="uberX">
            <p id="uberX"></p>
          </li>
          <li value="comfort">
            <p id="comfort"></p>
            <p id="caption">Newer cars with extra legroom</p>
          </li>
          <li value="pool">
            <p id="pool"></p>
            <p id="caption">Share the ride with 1 to 3 people</p>
          </li>
        </ul>
    </div>
  )
}

export default CostEstimation;
