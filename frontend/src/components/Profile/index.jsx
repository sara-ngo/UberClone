import React, {Component, useState} from "react";
import styles from "./styles.module.css";


const handleLogout = () => {
	localStorage.removeItem("token");
	window.location.reload();
};

export class Profile extends Component {
	state={profilePic:'profilePicture.jpg'}
	imageHandler = (e) => {
		const reader = new FileReader();
    reader.onload = () =>{
      if(reader.readyState === 2){
        this.setState({profileImg: reader.result})
	}
}

reader.readAsDataURL(e.target.files[0])
  };
  render() {
    const { profileImg} = this.state
	return (
		<div className={styles.main_container}>
			<nav className={styles.navbar}>
				<h1>Uber</h1>
				<button className={styles.white_btn} onClick={handleLogout}>
					Logout
					</button>
		</nav>
			<form method="">
				<div className="row">
					<div className="col-md-4">
						<div className="profile-img">
						<img src={profileImg} alt="" id="img" className="img"  />
						</div>
						<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
					<div className="label">
          <label className="image-upload" htmlFor="input">
						Choose your Photo
					</label>
          </div>
					</div>
					<div className="col-md-6">
						<div className="profile-head">
							<h5>Profile</h5>
							<h6>Rider</h6>
							<div className="row mt-3">
							<div className="col-md-6">
										<label>Name</label>
									</div>
									<div className="col-md-6">
									<input
							          type="text"
							          name="name"
							          onChange={handleLogout}/>	
									</div>
								</div>
								<div className="row mt-3">
									<div className="col-md-6">
										<label>Email</label>
									</div>
									<div className="col-md-6">
									<input
							          type="text"
							          name="email"
							          onChange={handleLogout}/>	
									</div>
								</div>
								<div className="row mt-3">
									<div className="col-md-6">
										<label>Phone Number</label>
									</div>
									<div className="col-md-6">
									<input
							          type="text"
							          name="phoneNumber"
							          onChange={handleLogout}/>								</div>
								</div>
								<div className="row mt-3">
									<div className="col-md-6">
										<label>Password</label>
									</div>
									<div className="col-md-6">
									<input
							          type="text"
							          name="password"
							          onChange={handleLogout}/>	
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
	);
}
}
export default Profile