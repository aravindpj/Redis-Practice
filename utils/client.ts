
import {createClient , type RedisClientType} from "redis"

let client : RedisClientType | null=null

export const intilizeRedisClient = async () =>{

    if(!client){
        client = createClient()

        client.on("error",(err)=>{
            console.error(err)
        })

        client.on("connect",(err)=>{
            console.log("Redis connected")
        })

        await client.connect()
    }

    return client
}