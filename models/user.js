import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

const tripSchema = new mongoose.Schema({
	rider: { type: String, required: true },
	riderID: { type: String, required: true },
	driver: { type: String, required: true },
	driverID: { type: String, required: true },
	riderRating: {type: Boolean, required: true, default: false},
	driverRating: {type: Boolean, required: true, default: false},
});

const userSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
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
	});
	return schema.validate(data);
};

export { User, Trip, validate };
