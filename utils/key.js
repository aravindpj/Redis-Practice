"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexKey = exports.getRestauratDetailsKey = exports.getWeatherKey = exports.getRestaurantByRating = exports.getRestaurantCuisinesKey = exports.getCuisineKey = exports.getCuisines = exports.getReviewDetailsById = exports.getReviewKey = exports.getRestaurantKeyById = exports.getKeyName = void 0;
var getKeyName = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return "bites:".concat(args.join(":"));
};
exports.getKeyName = getKeyName;
var getRestaurantKeyById = function (id) { return (0, exports.getKeyName)("restaurants", id); };
exports.getRestaurantKeyById = getRestaurantKeyById;
// for redis list
var getReviewKey = function (id) { return (0, exports.getKeyName)("review", id); };
exports.getReviewKey = getReviewKey;
// bites:review:56TYz3
var getReviewDetailsById = function (id) { return (0, exports.getKeyName)("review-details", id); };
exports.getReviewDetailsById = getReviewDetailsById;
exports.getCuisines = (0, exports.getKeyName)("cuisines");
var getCuisineKey = function (name) { return (0, exports.getKeyName)("cuisines", name); };
exports.getCuisineKey = getCuisineKey;
var getRestaurantCuisinesKey = function (id) { return (0, exports.getKeyName)("restaurant_cuisines", id); };
exports.getRestaurantCuisinesKey = getRestaurantCuisinesKey;
exports.getRestaurantByRating = (0, exports.getKeyName)("restaurant_rating");
var getWeatherKey = function (id) { return (0, exports.getKeyName)('weather', id); };
exports.getWeatherKey = getWeatherKey;
var getRestauratDetailsKey = function (id) { return (0, exports.getKeyName)('restaurant_details', id); };
exports.getRestauratDetailsKey = getRestauratDetailsKey;
exports.indexKey = (0, exports.getKeyName)("idx", "restaurants");
