import React, {useEffect, useState} from "react";
import axios from "axios";
import TripList from "../components/TripList/TripList";
import Navbar from '../components/Navbar/Navbar'
import * as Constants from "../constants.js"

import styles from "../styles/Profile.module.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [data,setData]=useState(null)
  const [update,setUpdate]=useState(false)

  useEffect(() => {
    const url = Constants.AUTHENTICATION_SERVER + "/api/userInfo";
    const userToken = localStorage.getItem('token');
    // check if the user is logged in
    if (!userToken) {
      console.log("ERROR: User not logged in!");
      return;
    }
    axios.post(url, {data: userToken}).then((res) => {
      if (res.data.errorMessage) {
        console.log("user info ERROR:", res.data.errorMessage);
        return;
      }
      setUser(res.data.newUser)
    });

  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const uploadImage = async e => {
    const files = e.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'darwin')
    setLoading(true)
    const res = await fetch(
      'https://api.cloudinary.com/v1_1/ngannguyen/image/upload',
      {
        method: 'POST',
        body: data
      }
    )
    const file = await res.json()

    setImage(file.secure_url)
    setLoading(false)
  }

  function getData(val) {
    console.warn(val.target.value)
    setData(val.target.value)
    setUpdate(false)
  }

  return (
  <div className={styles.main_container}>

    < Navbar/>
    <button className={styles.white_btn} onClick={handleLogout}>
      Log out
    </button>

    <div className={styles.container}>
      <h5>Profile</h5>
      <input type="file" name="file" placeholder="Upload an image" onChange={uploadImage}/>
      {loading ? (
        <h5>Loading...</h5>
      ) : (
        <img src={image} style={{ width: '300px' }} />
      )}
        {(user == null)
          ? ''
          : <div>
              <p>Name: {user.firstName}
                {user.lastName}</p>
              <p>Email: {user.email}</p>
              <TripList user={user} trips={user.trips}/>
            </div>
      }
      <div>
      <p>Phone Number:</p>
				{update?
                <h1> {data}</h1>
                :null
                }
			<input type="text" onChange={getData}></input>
			<button className={styles.button} onClick={()=>setUpdate(true)} >Update</button>
      </div>
    </div>
  </div>);
};

export default Profile;
