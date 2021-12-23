const mongoose = require('mongoose');
const Review = require("./reviews")
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
})

//virtual will create a virtual attribute that derive from other attribute
ImageSchema.virtual("thumbnail").get(function() { //now you can access campground.image.thumbnail
    return this.url.replace("/upload/", "/upload/w_200/")
})

const opts = {toJSON: {virtuals: true}} //able to stringify the virtual data in JSON

const campGroundSchema = Schema({
    title: String,
    images: [
        ImageSchema
    ],  
    geometry:{
        type: {
            type: String,
            enum: ["Point"],
            required:  true
        },
        coordinates: {
            type: [Number],
            required:  true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts)

campGroundSchema.virtual("properties.popUpMarkup").get(function() { //now you can access campground.image.thumbnail
    return `<strong><a href="/campground/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
})

campGroundSchema.post("findOneAndDelete", async function (doc) { //middleware to delete
    if (doc){
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
    }
})

module.exports = mongoose.model("Campground", campGroundSchema);