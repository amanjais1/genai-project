const express = require('express')
const authRouter = express.Router()

const authcontroller = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")




authRouter.post("/register", authcontroller.registerUserController)

authRouter.post("/login", authcontroller.loginUserController)

authRouter.get("/logout", authcontroller.logoutUserController)

authRouter.get("/get-me", authMiddleware.authUser, authcontroller.getMeController)



module.exports = authRouter;