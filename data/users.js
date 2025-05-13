import {
  getValidatedUserInfo,
  getValidatedUserCredentials,
  isValidEmail,
} from "../utils/authHelpers.js";
import {
  throwError,
  validateAndReturnString,
  sendVerificationEmail,
} from "../utils/helpers.js";
import { users } from "../config/mongoCollections.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ObjectId } from "mongodb";

function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().replace(/\.\d{3}Z$/, "");
}

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
    borough,
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

  const createdAt = getCurrentDateTime();
  const updatedAt = createdAt;

  const newUser = {
    firstName,
    lastName,
    email,
    hashPassword: hashedPassword,
    borough,
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

  delete created.hashPassword;
  
  return {
    ...created,
    _id: created._id.toString(),
  };
}

async function validEmailAndSendVerification(email) {
  email = validateAndReturnString(email, "Email");

  if (!isValidEmail(email)) throwError("Enter valid email ID!!");

  const user = await getUserByEmail(email);
  if (!user) throwError("User does not exist!!");

  const code = crypto.randomInt(100_000, 999_999).toString();
  const codeHash = bcrypt.hashSync(code, 10);

  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min

  const userCollection = await users();

  const updateInfo = await userCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        resetCodeHash: codeHash,
        resetCodeExpiry: expiresAt,
      },
    }
  );

  if (!updateInfo.modifiedCount) throwError("Some Error Occurred !!!");

  const result = await sendVerificationEmail(email, code);

  return {
    isVerificationSent: true,
    _id: user._id.toString(),
  };
}

async function verifyResetAndUpdatePassword(email, code, newPassword) {
  ({ email, password: newPassword } = getValidatedUserCredentials(
    email,
    newPassword
  ));

  const user = await getUserByEmail(email);
  if (!user) throwError("User does not exist!!");

  const passwordMatch = await bcrypt.compare(newPassword, user.hashPassword);

  if (passwordMatch) throwError("Cannot reuse the old password for new password!!");

  if (!user.resetCodeHash || !user.resetCodeExpiry)
    throwError("No reset initiated for this user!!");

  if (Date.now() > user.resetCodeExpiry)
    throwError("Verification code expired!!");

  const doCodesMatch = await bcrypt.compare(code, user.resetCodeHash);
  if (!doCodesMatch) throwError("Invalid verification code provided!!");

  //hash the password
  const hashedPassword = getHashedPassword(newPassword);

  //Updating the updatedAt field for the user
  const updatedAt = getCurrentDateTime();

  const userCollection = await users();

  const updateInfo = await userCollection.updateOne(
    { _id: user._id },
    {
      $set: { hashPassword: hashedPassword, updatedAt },
      $unset: { resetCodeHash: "", resetCodeExpiry: "" },
    }
  );
  
  if (!updateInfo.modifiedCount) throwError("Some Error Occurred !!!");

  return {
    isPasswordUpdated: true,
    _id: user._id.toString(),
  };
}

async function updateUserDetails(userData, userEmail) {
  userData = getValidatedUserInfo(userData, true);
  let {
    firstName,
    lastName,
    email,
    password,
    borough,
    gender,
    age,
  } = userData;

  if(email !== userEmail) throwError("Provided user is not the same user who logged in!!");

  const userFound = await getUserByEmail(email);
  if (!userFound) throwError("User doesn't exist");

  //hash the password
  let hashedPassword = undefined;
  
  if(password.length)
    hashedPassword = getHashedPassword(password);

  const updatedAt = getCurrentDateTime();

  const newUserDetails = {
    firstName,
    lastName,
    borough,
    gender,
    age,
    updatedAt,
  };

  if(password.length) newUserDetails.hashPassword = hashedPassword;

  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: userFound._id },
    {
      $set: newUserDetails,
    }
  );
  
  if (!updateInfo.modifiedCount) throwError("Some Error Occurred !!!");

  const result = {...userFound, ...newUserDetails};

  delete result.hashPassword;

  return {
    ...result,
    _id: result._id.toString(),
  };
}

export { userLogin, createUser, validEmailAndSendVerification, verifyResetAndUpdatePassword, updateUserDetails };
