import type {Request,Response,NextFunction} from "express"
import { intilizeRedisClient } from "../utils/client"
import { getRestaurantKeyById } from "../utils/key"

export const checkRestaurantId=async(req:Request,res:Response,next:NextFunction)=>{
    
    const client = await intilizeRedisClient()

    const {restaurantId}=req.params
    

    if(!restaurantId) return res.status(400).json({status:false,message:"restaurant id not found"})


    const restaurantKey=getRestaurantKeyById(restaurantId)

    const exist = await client.exists(restaurantKey)

    if(!exist) return res.status(400).json({status:false,message:"no data found this restaurant id"})
 
    next()
}