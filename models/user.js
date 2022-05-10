import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const tripSchema = new mongoose.Schema({
	tripId: { type: String },
	driverMatched: { type: Boolean },
	driverMatchedConfirm: { type: Boolean },
	inProgress: { type: Boolean },
	completed: { type: Boolean },
	hasRiderRating: { type: Boolean },
	hasDriverRating: { type: Boolean },
	riderSocketId: { type: String },
	riderId: { type: String },
	riderName: { type: String },
	riderRating: { type: Number, default: 0 },
	driverSocketId: { type: String },
	driverId: { type: String },
	driverName: { type: String },
	driverRating: { type: Number, default: 0 },
	startLat: { type: Number, default: 0 },
	startLong: { type: Number, default: 0 },
	endLat: { type: Number, default: 0 },
	endLong: { type: Number, default: 0 },
	type: { type: String },
	distanceEstimate: { type: Number, default: 0 },
	durationEstimate: { type: Number, default: 0 },
	costEstimate: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	vehicle: { type: String, required: false },
	rating: { type: Number, required: true, default: 0},
	numRatings: { type: Number, required: false },
	trips: [String],
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};

const User = mongoose.model("user", userSchema);

const Trip = mongoose.model("trip", tripSchema)

const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
		vehicle: Joi.string().label("Vehicle"),
	});
	return schema.validate(data);
};

export { User, Trip, validate };
