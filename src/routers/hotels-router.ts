import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelRouter = Router();

hotelRouter
    .all("/*", authenticateToken)
    .get("/")
    .get("/:hotelId")

export {hotelRouter};