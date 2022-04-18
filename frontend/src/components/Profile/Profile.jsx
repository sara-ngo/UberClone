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
					<p>email: {user.email}</p>
					<TripList user={user} trips={user.trips} />
				</div>
			}
		</div>
	);
};

export default Profile;