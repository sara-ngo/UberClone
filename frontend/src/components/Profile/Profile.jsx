import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import TripList from "./TripList";

const Profile = () => {
	const [user, setUser] = useState(null);
	const [profilePic, setProfilePic] = useState(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		const url = "http://localhost:5000/api/userInfo";
		axios.post(url, { data: localStorage.getItem('token') }).then((res) => {
			setUser(res.data.newUser)
		})

	}, [])

	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.reload();
	};
    const imageHandler = (e) => {
	   setError(false);
       const selected = e.target.files[0];
       const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];
       if (selected && ALLOWED_TYPES.includes(selected.type)) {
          const reader = new FileReader();
          reader.onload = () => {
             setProfilePic(reader.result);
         };
       reader.readAsDataURL(selected);
      } else {
      setError(true);
    }
  };

	return (
		<div className={styles.main_container}>
			<nav className={styles.navbar}>
				<h1>Uber</h1>
				<button className={styles.white_btn} onClick={handleLogout}>
					Logout
				</button>
			</nav>
			<div className={styles.container}>
			<h5>Profile</h5>
        {error && <p className={styles.errorMsg}>File not supported</p>}
        <div
          className="profilePic"
          style={{
            background: styles.profilePic
              ? `url("${styles.profilePic}") no-repeat center/cover`
              : "#131313"
          }}
        >
          {!profilePic && (
            <>
              <p>Add an image</p>
              <label htmlFor="fileUpload" className="customFileUpload">
                Choose file
              </label>
              <input type="file" id="fileUpload" onChange={imageHandler} />
              <span>(jpg, jpeg or png)</span>
            </>
          )}
        </div>
        {profilePic && (
          <button onClick={() => setProfilePic(null)}>Remove image</button>
        )}
			{(user == null) ? '' :
				<div>
					<p>Name: {user.firstName} {user.lastName}</p>
					<p>Email: {user.email}</p>
					<TripList user={user} trips={user.trips} />
				</div>
			}
			<div>
				<p>Phone Number:</p>
			<input type="text" name="Phone Number"></input>
			</div>
			<div>
				<p>New Password:</p>
			<input type="text" name="Password"></input>
			</div>
			<div>
			<input type="submit" value="Update Profile"></input>
			</div>
		</div>
		</div>
	);
};

export default Profile;