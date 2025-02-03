import express from "express";
import type { Request, Response, NextFunction } from "express";
import { validate } from "../middleware/validate";
import {
  RestaurantDetailsSchema,
  RestaurantSchema,
  type Restaurant,
  type RestaurantDetails
} from "../schemas/restaurants";
import {
  getCuisineKey,
  getCuisines,
  getRestaurantByRating,
  getRestaurantCuisinesKey,
  getRestaurantKeyById,
  getRestauratDetailsKey,
  getReviewDetailsById,
  getReviewKey,
  getWeatherKey,
} from "../utils/key";
import { nanoid } from "nanoid";
import { intilizeRedisClient } from "../utils/client";
import { errorResponse, successResponse } from "../utils/responses";
import { checkRestaurantId } from "../middleware/checkRestaurantId";
import { ReviewSchema, type Review } from "../schemas/review";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const start = (Number(page) - 1) * Number(limit);

  const end = start + Number(limit) - 1;

  try {
    const client = await intilizeRedisClient();
    const restaurantIds = await client.zRange(
      getRestaurantByRating,
      start,
      end,
      {
        REV: true,
      }
    );
    const restaurants = await Promise.all(
      restaurantIds.map((id) => client.hGetAll(getRestaurantKeyById(id)))
    );

    successResponse(res, restaurants);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  validate(RestaurantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await intilizeRedisClient();

      const data = req.body as Restaurant;

      const id = nanoid();

      const restaurantKey = getRestaurantKeyById(id);

      const payload = { id, name: data.name, location: data.location };

      await Promise.all([
        data.cuisines.map((cuisine) =>
          Promise.all([
            client.sAdd(getCuisines, cuisine),
            client.sAdd(getCuisineKey(cuisine), id), // italian -> rest:1 ,french -> rest:1
            client.sAdd(getRestaurantCuisinesKey(id), cuisine), // rest:1 -> italian rest:1-> french
          ])
        ),
        client.hSet(restaurantKey, payload),
        client.zAdd(getRestaurantByRating, {
          score: 0,
          value: id,
        }),
      ]);

      return successResponse(res, payload);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:restaurantId/details",
  checkRestaurantId,
  validate(RestaurantDetailsSchema),
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const {restaurantId}=req.params

    const restaurantDeatilKey=getRestauratDetailsKey(restaurantId)

    try {
      const client=await intilizeRedisClient()

      const data = req.body as RestaurantDetails

      await client.json.set(restaurantDeatilKey, "." , data)

      return successResponse(res,{},"Restaurant details added")

    } catch (error) {
      next(error)
    }

  }
);

router.get(
  "/:restaurantId/details",
  checkRestaurantId,
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const {restaurantId}=req.params

    const restaurantDeatilKey=getRestauratDetailsKey(restaurantId)

    try {
      const client=await intilizeRedisClient()


      const details=await client.json.get(restaurantDeatilKey)

      return successResponse(res,details)

    } catch (error) {
      next(error)
    }

  }
);

router.get(
  "/:restaurantId/weather",
  checkRestaurantId,
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const { restaurantId } = req.params;
    console.log(restaurantId);
    const restaurantKey = getRestaurantKeyById(restaurantId);
    const weatherKey = getWeatherKey(restaurantId);

    try {
      const client = await intilizeRedisClient();

      const weatherData = await client.get(weatherKey);

      if (weatherData) return successResponse(res, JSON.parse(weatherData));
      console.log(restaurantKey);

      const coords = await client.hGet(restaurantKey, "location");
      console.log(coords);
      if (!coords) {
        return errorResponse(res, 404, "location not found");
      }

      const [lat, lng] = coords;

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=${lat}&lon=${lng}&appid=${process.env.WEATHER_API_KEY}`
      );

      if (response.status !== 200) {
        return errorResponse(res, 404, "not get any weather updates");
      }
      const data = await response.json();
      await client.set(weatherKey, JSON.stringify(data));

      return successResponse(res, data);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:restaurantId",
  checkRestaurantId,
  async (req: Request<{ restaurantId: string }>, res, next) => {
    try {
      const client = await intilizeRedisClient();
      const { restaurantId } = req.params;

      const restaurantKey = getRestaurantKeyById(restaurantId);

      const [viewCount, restaurant, cuisines] = await Promise.all([
        client.hIncrBy(restaurantKey, "viewCount", 1),
        client.hGetAll(restaurantKey),
        client.sMembers(getRestaurantCuisinesKey(restaurantId)), // filer by the rest id
      ]);

      return successResponse(res, { ...restaurant, cuisines });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:restaurantId/review",
  checkRestaurantId,
  validate(ReviewSchema),
  async (req: Request<{ restaurantId: string }>, res, next) => {
    const { restaurantId } = req.params;
    const data = req.body as Review;

    const reviewId = nanoid();

    const reviewDetailsKey = getReviewDetailsById(reviewId);
    const reviewKey = getReviewKey(restaurantId);
    const restaurantKey = getRestaurantKeyById(restaurantId);
    const reviewPayload = { id: reviewId, ...data, timeStamp: Date.now() };

    try {
      const client = await intilizeRedisClient();
      const [reviewCount, rateResult, totalStars] = await Promise.all([
        client.lPush(reviewKey, reviewId),
        client.hSet(reviewDetailsKey, reviewPayload),
        client.hIncrByFloat(restaurantKey, "totalStars", data.rating),
      ]);

      const avg = Number((reviewCount / totalStars).toFixed(1));

      await Promise.all([
        client.zAdd(getRestaurantByRating, {
          score: avg,
          value: restaurantId,
        }),
      ]);

      successResponse(res, reviewPayload);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:restaurantId/review",
  checkRestaurantId,
  async (
    req: Request<{ restaurantId: string; page: string; limit: string }>,
    res,
    next
  ) => {
    const { restaurantId } = req.params;
    const { page, limit } = req.query;

    const start = (Number(page) - 1) * Number(limit);

    const end = start + Number(limit) - 1;

    const reviewKey = getReviewKey(restaurantId);

    try {
      const client = await intilizeRedisClient();

      const reviewIds = await client.lRange(reviewKey, start, end);

      const reviews = await Promise.all(
        reviewIds.map((id) => client.hGetAll(getReviewDetailsById(id)))
      );
      successResponse(res, reviews);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:restaurantId/review/:reviewId",
  checkRestaurantId,
  async (
    req: Request<{ restaurantId: string; reviewId: string }>,
    res,
    next
  ) => {
    const { restaurantId, reviewId } = req.params;
    const reviewKey = getReviewKey(restaurantId);
    const reviewDetailsKey = getReviewDetailsById(reviewId);

    try {
      const client = await intilizeRedisClient();
      const [removeResult, deleteReview] = await Promise.all([
        client.lRem(reviewKey, 0, reviewId),
        client.del(reviewDetailsKey),
      ]);

      if (!removeResult || !deleteReview)
        return errorResponse(res, 404, "Review not found");

      successResponse(res, reviewId, "Review deleted");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
