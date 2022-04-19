import React from "react";
import picture from "./profilePicture.jpg"
// import styles from "./styles.module.css";

// const handleLogout = () => {
// 	localStorage.removeItem("token");
// 	window.location.reload();
// };

const Profile = () => {
	return (
		// <div className={styles.main_container}>
		// 	<nav className={styles.navbar}>
		// 		<h1>Uber</h1>
		// 		<button className={styles.white_btn} onClick={handleLogout}>
		// 			Logout
		<div className="container emp-profile">
			<form method="">
				<div className="row">
					<div className="col-md-4.5">
						<div className="profile-img">
						<img src={picture} alt="profile" />
						</div>
					</div>
					<div className="col-md-6">
						<div className="profile-head">
							<h5>Profile</h5>
							<h6>Rider</h6>
							<p className="user-rating mt-3 mb-4">RATING: <span> 4.8/5 </span> </p>
							<div className="row mt-3">
							<div className="col-md-6">
										<label>Name</label>
									</div>
									<div className="col-md-6">
										<p>Ngan Nguyen</p>
									</div>
								</div>
								<div className="row mt-3">
									<div className="col-md-6">
										<label>Email</label>
									</div>
									<div className="col-md-6">
										<p>ngannpt9@gmail.com</p>
									</div>
								</div>
								<div className="row mt-3">
									<div className="col-md-6">
										<label>Phone Number</label>
									</div>
									<div className="col-md-6">
										<p>510-766-5900</p>
									</div>
								</div>
								<div className="row mt-3">
									<div className="col-md-6">
										<label>Password</label>
									</div>
									<div className="col-md-6">
										<p>*********</p>
									</div>
									</div>
						</div>
					</div>
					<div className="col-md-1">
						<input type="submit" className="profile-edit-btn" name="btnAddMore" value="Edit Profile"></input>
					</div>
					</div>
			</form>
		</div>
	
	)
}
export default Profile