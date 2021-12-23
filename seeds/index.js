const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

// connect to mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //check database connection
db.once("open", function () {
  console.log("database connected");
});

const campGroundModel = require("../model/campground");

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await campGroundModel.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const c = new campGroundModel({
      author: "61c0337ca4785f055d0585cd",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dcy801cpi/image/upload/v1639978783/YelpCamp/zbz0cewedlhjvrukzdmi.jpg',
          filename: 'YelpCamp/zbz0cewedlhjvrukzdmi'
        }
      ],
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Similique dolores odio facilis ratione blanditiis reprehenderit tempore id corporis, ad minus temporibus, consequatur corrupti, provident facere veniam quam ducimus dolorem eveniet?",
      price: Math.floor(Math.random() * 50),
    });
    await c.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
