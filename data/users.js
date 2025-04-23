import { getValidatedUserInfo, isValidEmail } from "../utils/authHelpers.js";
import { throwError } from "../utils/helpers.js";
import { users } from "../config/mongoCollections.js";
import bcrypt from "bcryptjs";

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

async function userLogin(userEmail, userPassword) {
  const { email, password } = getValidatedUserCredentials(
    userEmail,
    userPassword
  );

  //check if the email is valid
  if (!isValidEmail(email)) throwError("Please enter a valid email address.");

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
  const createdAt = (updatedAt = now.toISOString().replace(/\.\d{3}Z$/, ""));

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

  if (insertInfo.insertedCount === 0) throwError("Could not add user.");

  return {
    ...insertInfo,
    _id: insertInfo._id.toString(),
  };
}

export { userLogin, createUser };
