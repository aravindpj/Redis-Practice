import express from "express"
import { intilizeRedisClient } from "../utils/client"
import { getCuisineKey, getCuisines, getRestaurantKeyById } from "../utils/key"
import { successResponse } from "../utils/responses"

const router = express.Router()

router.get("/",async(req,res,next)=>{
    try {
        const clinet = await intilizeRedisClient()

        const cuisines=await clinet.sMembers(getCuisines)

        successResponse(res,cuisines)
        
    } catch (error) {
        next(error)
    }
})


router.get('/:cuisine',async (req,res,next)=>{
    const {cuisine}=req.params

    try {
        const client = await intilizeRedisClient()
        
        const restaurantIds=await client.sMembers(getCuisineKey(cuisine))
 
        const restaurants=await Promise.all( restaurantIds.map(id=>client.hGet(getRestaurantKeyById(id),"name")))

        successResponse(res,{cuisine,restaurants})
    } catch (error) {
        next(error)
    }
})

export default router