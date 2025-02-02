export const getKeyName=(...args:string[])=>{
   return `bites:${args.join(":")}`
}

export const getRestaurantKeyById = (id:string) => getKeyName("restaurants",id)

// for redis list
export const getReviewKey=(id:string)=>getKeyName("review",id)
// bites:review:56TYz3


export const getReviewDetailsById=(id:string)=>getKeyName("review-details",id)

export const getCuisines=getKeyName("cuisines")

export const getCuisineKey=(name:string)=>getKeyName("cuisines",name)

export const getRestaurantCuisinesKey=(id:string)=>getKeyName("restaurant_cuisines",id)