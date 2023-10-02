import { getHotelById, getHotels } from "@/controllers/hotels-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelRouter = Router();

hotelRouter
    .all("/*", authenticateToken)
    .get("/", getHotels)
    .get("/:hotelId", getHotelById)

export {hotelRouter};