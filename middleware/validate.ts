import type {Request,Response,NextFunction} from "express"
import {ZodSchema} from "zod"


export const validate = <T>(schema:ZodSchema<T>)=> (req:Request,res:Response,next:NextFunction):void =>{
    
    const result= schema.safeParse(req.body)


    if(!result.success){
        res.status(400).json({status:false,errors:result.error.errors})
        return
    }

    next()
}