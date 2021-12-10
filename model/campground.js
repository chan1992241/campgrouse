const mongoose = require('mongoose');
const Review = require("./reviews")
const Schema = mongoose.Schema

const campGroundSchema = Schema({
    title: String,
    image: String,  
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})
campGroundSchema.post("findOneAndDelete", async function (doc) { //middleware to delete
    if (doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

module.exports = mongoose.model("Campground", campGroundSchema);