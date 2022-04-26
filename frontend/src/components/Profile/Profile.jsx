import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import TripList from "./TripList";

const Profile = () => {
	const [user, setUser] = useState(null);

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


	return (
		<div className={styles.main_container}>
			<nav className={styles.navbar}>
				<h1>Uber</h1>
				<button className={styles.white_btn} onClick={handleLogout}>
					Logout
				</button>
			</nav>
			{(user == null) ? '' :
				<div>
					<h5>Profile</h5>
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
	);
};

export default Profile;