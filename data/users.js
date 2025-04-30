import {
  getValidatedUserInfo,
  getValidatedUserCredentials,
} from "../utils/authHelpers.js";
import { throwError, validateAndReturnString } from "../utils/helpers.js";
import { users } from "../config/mongoCollections.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

async function getUserByEmail(email) {
  const userCollection = await users();
  const userFound = await userCollection.findOne({ email });

  return userFound;
}

function getHashedPassword(password) {
  const saltRounds = 16;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  return hashedPassword;
}

async function userLogin(email, password) {
  ({ email, password } = getValidatedUserCredentials(email, password));

  console.log("User email: ", email, "User password: ", password);
  //Checking if email and password are matching to correct user credentials
  const userFound = await getUserByEmail(email);

  if (!userFound) throwError(`User with email ${email} not found.`);
  const passwordMatch = await bcrypt.compare(password, userFound.hashPassword);

  if (!passwordMatch) throwError(`${password} is incorrect, please try again.`);

  return {
    ...userFound,
    _id: userFound._id.toString(),
  };
}

async function getUserById(userId) {
  if (!userId || !ObjectId.isValid(userId)) {
    throwError("User ID is not a valid ObjectId.");
  }

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throwError(`User with ID ${userId} not found.`);
  }

  return {
    ...user,
    _id: user._id.toString(),
  };
}

async function createUser(userData) {
  userData = getValidatedUserInfo(userData);
  let {
    firstName,
    lastName,
    email,
    password,
    city,
    state,
    gender,
    age,
    role = "user",
  } = userData;

  //check if the email already exists
  const userFound = await getUserByEmail(email);
  if (userFound) throwError(`User with email ${email} already exists.`);

  //hash the password
  const hashedPassword = getHashedPassword(password);

  const now = new Date();
  const createdAt = now.toISOString().replace(/\.\d{3}Z$/, "");
  const updatedAt = createdAt;

  const newUser = {
    firstName,
    lastName,
    email,
    hashPassword: hashedPassword,
    city,
    state,
    gender,
    age,
    role,
    createdAt,
    updatedAt,
  };

  const userCollection = await users();
  const insertInfo = await userCollection.insertOne(newUser);

  if (!insertInfo.acknowledged) throwError("Could not add user.");

  const created = await getUserById(insertInfo.insertedId);

  console.log("User Info: ", created);
  return {
    ...created,
    _id: created._id.toString(),
  };
}

export { userLogin, createUser };
