const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var fetchuser = require('../middleware/fetchuser')
//  ROUTE 1: Create a user using POST "/api/auth/createuser". No login required
const jwt = require("jsonwebtoken");

const JWT_SECRET = "IamGaurav";

router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false
    // If there are eroors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    // Check wheater the user with the same email exists already

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success,error: "Email already exists!" });
      }

      const salt = await bcrypt.genSaltSync(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      //  console.log(jwtData)
      success=true
      res.json({ success,authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE2: Authenticate a user using POST "/api/auth/login". No login required

router.post(
  "/login",
  [
    body("password", "Password can not be blank").exists(),
    body("email", "Enter a valid email").isEmail(),
  ],
  async (req, res) => {
    let success=false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success=false
        return res.status(400).json({ errors: "Incorrect credentials" });
      }

      const passwordConmpare = await bcrypt.compare(password, user.password);
      if (!passwordConmpare) {
        success=false
        return res.status(400).json({ success, errors: "Incorrect credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      success=true
      res.json({ success,authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE3: Get logged in user details using POST "/api/auth/getuser".  required

router.post("/getuser", fetchuser, async (req, res) => {
        try{
            userID = req.user.id;
            const user = await User.findById(userID).select("-password");
            res.send(user)
        }catch(error){
              res.status(500).send("Internal Server error");
        }


    })





module.exports = router;
