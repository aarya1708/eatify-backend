import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { setUser } from './service/auth.js';
import cookieParser from "cookie-parser";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bodyParser from 'body-parser';
import nodemailer from "nodemailer";

const PORT = 9000;

const app = express();

app.use(bodyParser.json());

// app.use(cors({
//     origin: (origin, callback) => {
//         callback(null, true);
//     },
//     methods: ["GET", "POST", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
// }));
//
// app.options("*", cors());

//new 
const allowedOrigins = [
  'http://localhost:3000',
  'https://eatify-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
//end new


app.use(express.json());
app.use(cookieParser());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        min: [1000000000, 'Phone Number should contain 10 digits'],
        max: [9999999999, 'Phone Number should contain 10 digits']
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
    },
    previousOrders: [{
        id: { type: String, required: true, unique: true },
        orderDate: { type: String, required: true, },
        customerName: { type: String, required: true },
        restaurantName: { type: String, required: true },
        orderDetails: { type: Array, required: true },
        totalPrice: { type: Number, required: true },
        deliveryFee: { type: Number, required: true },
        deliveryPartner: { type: String, required: true },
        paymentMethod: { type: String, required: true },
    }]
}
);

const restSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    deliveryTime: {
        type: String,
        required: true,
    },
    highlights: {
        type: String,
        required: true,
    },
    photoUrl: {
        type: String,
        required: true,
    },
    price2person: {
        type: Number,
        required: true,
    },
    menu: [{
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        photoUrl: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        veg: {
            type: String,
            required: true,
        }
    }]
});

const currentRestOrdersSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    restaurantName: {
        type: String,
        required: true,
    },
    orderDetails: [
        {
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    totalQuantity: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: "Pending",
        required: true,
    },
    deliveryPartner: {
        type: String,
        required: true,
    },
    deliveryFee: {
        type: Number,
        required: true,
    },
    paymentMethod: { type: String, required: true },

});

const currentDeliveryOrdersSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    customerAddress: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: Number,
        required: true,
    },
    restName: {
        type: String,
        required: true,
    },
    restAddress: {
        type: String,
        required: true,
    },
    restPhone: {
        type: Number,
        required: true,
    },
    orderDetails: [
        {
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    billTotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        required: true,
    },
    deliveryPartner: {
        type: String,
        required: true,
        default: "NULL"
    },
    paymentMethod: {type: String, required: true},
});

const currentAcceptedDeliveryOrdersSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    customerAddress: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: Number,
        required: true,
    },
    restName: {
        type: String,
        required: true,
    },
    restAddress: {
        type: String,
        required: true,
    },
    restPhone: {
        type: Number,
        required: true,
    },
    orderDetails: [
        {
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    billTotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        required: true,
    },
    deliveryPartner: {
        type: String,
        required: true,
    },
    paymentMethod: {type: String, required: true},
});

const currentAcceptedCustomersOrdersSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    restName: {
        type: String,
        required: true,
    },
    orderDetails: [
        {
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    billTotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        required: true,
    },
    deliveryPartner: {
        type: String,
        required: true,
    },
    deliveryPartnerContact: {
        type: Number,
    },
    paymentMethod: {
        type: String, 
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "Order yet to be accepted by restaurant"
    },
});

const otpSchema = new mongoose.Schema({
    orderId: { type: Number, required: true, unique: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }
});

const userDetails = mongoose.model('User-Details', userSchema);
const restDetails = mongoose.model('Rest-Details', restSchema);
const currentRestOrders = mongoose.model('Current-Restaurant-Orders', currentRestOrdersSchema);
const currentDeliveryOrders = mongoose.model('Current-Delivery-Orders', currentDeliveryOrdersSchema);
const currentAcceptedDeliveryOrders = mongoose.model('Current-Accepted-Delivery-Orders', currentAcceptedDeliveryOrdersSchema);
const currentAcceptedCustomersOrders = mongoose.model('Current-Accepted-Customers-Orders', currentAcceptedCustomersOrdersSchema);
const otps = mongoose.model("Otps", otpSchema);

app.post('/signup-as-customer', async (req, res) => {
    const { name, email, phone, address, password } = req.body;
    try {
        const newUser = new userDetails({ name, email, phone, address, password });
        newUser.userType = "customer";
        await newUser.save();
        return res.sendStatus(200);
    }
    catch (error) {
        return res.sendStatus(400);
    }
});

app.post('/signup-as-delivery', async (req, res) => {
    const { name, email, phone, address, password } = req.body;
    try {
        const newUser = new userDetails({ name, email, phone, address, password });
        newUser.userType = "delivery-partner";
        await newUser.save();
        return res.sendStatus(200);
    }
    catch (error) {
        return res.sendStatus(400);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userDetails.findOne({ email, password });
        if (!user) {
            return res.sendStatus(400);
        }
        const token = setUser(user);

        // res.cookie("uid", token, {
        //     httpOnly: true,
        //     secure: req.hostname.includes("vercel.app"),  // Disable secure flag for local dev
        //     sameSite: "lax",
        // });

        //new
        res.cookie("uid", token, {
            httpOnly: true,
            secure: req.hostname.includes("vercel.app"),  // Disable secure flag for local dev
            sameSite: "None",
        });
        //end new
        
        return res.json({ token, userType: user.userType, userName: user.name })
    } catch (error) {
        console.error(error);
        return res.sendStatus(400);
    }
});

app.get("/user-auth", async (req, res) => {
    try {
        const user = await userDetails.find();
        if (!user.length) {
            return res.status(404).json({ message: "No user found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/restaurants-auth", async (req, res) => {
    try {
        const restaurants = await restDetails.find();
        if (!restaurants.length) {
            return res.status(404).json({ message: "No restaurants found" });
        }
        res.json(restaurants);
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/cart", async (req, res) => {
    const name = req.query.name;
    const restaurant = await restDetails.findOne({ name });
    res.json(restaurant);
});

app.post('/profile', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            console.error('No email received in request');
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await userDetails.findOne({ email });

        if (!user) {
            console.error('No user found for email:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/rest-menu', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            console.error('No email received in request');
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await restDetails.findOne({ email });

        if (!user) {
            console.error('No user found for email:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/McDonald's", async (req, res) => {
    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "McDonald's" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("McDonald's not found");
                return res.status(404).json({ error: "McDonald's not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/McDonald's", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "McDonald's", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/McDonald's", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "McDonald's" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "McDonald's or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/Subway", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "Subway" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("Subway not found");
                return res.status(404).json({ error: "Subway not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/Subway", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Subway", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/Subway", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Subway" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Subway or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/Pizza%20Hut", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "Pizza Hut" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("Pizza Hut not found");
                return res.status(404).json({ error: "Pizza Hut not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/Pizza%20Hut", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Pizza Hut", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/Pizza%20Hut", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Pizza Hut" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Pizza Hut or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/Temptations", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "Temptations" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("Temptations not found");
                return res.status(404).json({ error: "Temptations not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/Temptations", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Temptations", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/Temptations", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Temptations" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Temptations or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/Domino's%20Pizza", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "Domino's Pizza" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("Domino's Pizza not found");
                return res.status(404).json({ error: "Domino's Pizza not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/Domino's%20Pizza", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Domino's Pizza", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/Domino's%20Pizza", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Domino's Pizza" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Domino's Pizza or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/Kakke%20Di%20Hatti", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "Kakke Di Hatti" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("Kakke Di Hatti not found");
                return res.status(404).json({ error: "Kakke Di Hatti not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/Kakke%20Di%20Hatti", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Kakke Di Hatti", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/Kakke%20Di%20Hatti", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "Kakke Di Hatti" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "Kakke Di Hatti or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/KFC", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "KFC" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("KFC not found");
                return res.status(404).json({ error: "KFC not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/KFC", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "KFC", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/KFC", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "KFC" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "KFC or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/United%20Farmers%20Creamery", async (req, res) => {
    // console.log("Received Request:", req.body);

    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === 'user') {
            const { email } = req.body;

            if (!email) {
                console.error('No email received in request');
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await restDetails.findOne({ email });

            if (!user) {
                console.error('No user found for email:', email);
                return res.status(404).json({ error: 'User not found' });
            }

            return res.status(200).json(user);
        }

        else if (action === 'adddish') {

            const { name, price, category, description, veg, photoUrl } = req.body;

            if (!name || !price || !category || !description || !veg || !photoUrl) {
                console.error("Missing required fields:", req.body);
                return res.status(400).json({ error: "All fields are required" });
            }

            const updatedRestaurant = await restDetails.findOneAndUpdate(
                { name: "United Farmers Creamery" },
                {
                    $push: { menu: { name, price, description, photoUrl, category, veg } }
                },
                { new: true }
            );

            if (!updatedRestaurant) {
                console.error("United Farmers Creamery not found");
                return res.status(404).json({ error: "United Farmers Creamery not found" });
            }

            return res.status(201).json({ message: "Dish added successfully", menu: updatedRestaurant.menu });
        }

        else {
            return res.status(400).json({ message: "Invalid action type" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.patch("/United%20Farmers%20Creamery", async (req, res) => {
    try {
        const { oldDishName, name, price, category, description, veg, photoUrl } = req.body;

        if (!oldDishName || !name) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Old dish name and new dish name are required for updating" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "United Farmers Creamery", "menu.name": oldDishName },
            {
                $set: {
                    "menu.$.price": price,
                    "menu.$.category": category,
                    "menu.$.description": description,
                    "menu.$.veg": veg,
                    "menu.$.photoUrl": photoUrl,
                    "menu.$.name": name,
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Dish updated successfully", updatedDish: updatedRestaurant.menu.find(dish => dish.name === name) });
    } catch (error) {
        console.error("Error updating dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/United%20Farmers%20Creamery", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Dish name is required for deletion" });
        }

        const updatedRestaurant = await restDetails.findOneAndUpdate(
            { name: "United Farmers Creamery" },
            { $pull: { menu: { name } } },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ error: "United Farmers Creamery or dish not found" });
        }

        res.status(200).json({ message: "Dish deleted successfully", menu: updatedRestaurant.menu });
    } catch (error) {
        console.error("Error deleting dish:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/cart", async (req, res) => {
    try {
        const { id, customerName, customerEmail, restaurantName, orderDetails, totalQuantity, totalPrice, deliveryFee, paymentMethod } = req.body;

        if (!id || !customerName || !orderDetails.length || !totalQuantity || !totalPrice || !paymentMethod) {
            return res.status(400).json({ message: "Invalid order data" });
        }

        const newOrder = new currentRestOrders({
            id,
            customerName,
            customerEmail,
            restaurantName,
            orderDetails,
            totalQuantity,
            totalPrice,
            deliveryPartner: "NULL",
            deliveryFee,
            paymentMethod
        });
        await newOrder.save();

        const newOrder2 = new currentAcceptedCustomersOrders({
            id,
            customerEmail,
            restName: restaurantName,
            orderDetails,
            billTotal: totalPrice + deliveryFee,
            deliveryPartner: "NULL",
            deliveryFee,
            paymentMethod
        });
        await newOrder2.save();

        res.status(201).json({ message: "Order stored successfully", order: newOrder });
    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/rest-order", async (req, res) => {
    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({ error: "Action is required" });
        }

        if (action === "restaurant") {
            const { restaurantName } = req.body;
            const name = restaurantName;
            const orders = await currentRestOrders.find({ restaurantName });

            const details = await userDetails.findOne({ name });

            return res.json({ orders: orders, prevOrders: details.previousOrders });
        }

        else if (action === "delivery") {
            const { order } = req.body;

            if (!order) {
                return res.status(400).json({ error: "Order data is required" });
            }

            const email = order.customerEmail;
            const customer = await userDetails.findOne({ email });
            const name = order.restaurantName;
            const restaurant = await userDetails.findOne({ name });

            const existingOrder = await currentDeliveryOrders.findOne({ id: order.id });
            if (existingOrder) {
                return res.status(400).json({ error: "Order already exists in delivery system" });
            }
            const newOrder = new currentDeliveryOrders({
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerAddress: customer.address,
                customerPhone: customer.phone,
                restName: order.restaurantName,
                restAddress: restaurant.address,
                restPhone: restaurant.phone,
                orderDetails: order.orderDetails,
                billTotal: order.totalPrice + order.deliveryFee,
                deliveryFee: order.deliveryFee,
                paymentMethod: order.paymentMethod
            });
            await newOrder.save();

            return res.status(200).json({ message: "Order sent to delivery" });
        }

        else if (action === "prevOrder") {
            const { order } = req.body;

            if (!order) {
                return res.status(400).json({ error: "Order data is required" });
            }

            const email = order.customerEmail;
            const name = order.restaurantName;

            const prevOrderData = {
                id: order.id,
                orderDate: new Date().toLocaleDateString('en-CA'),
                customerName: order.customerName,
                restaurantName: order.restaurantName,
                orderDetails: order.orderDetails,
                totalPrice: order.totalPrice,
                deliveryFee: order.deliveryFee,
                deliveryPartner: order.deliveryPartner,
                paymentMethod: order.paymentMethod
            };

            await currentAcceptedCustomersOrders.updateOne(
                { id:order.id },
                { $set: { status: "Order on it's way to you" } }
            );

            await userDetails.updateOne(
                { name },
                { $push: { previousOrders: prevOrderData } }
            );

            return res.status(200).json({ message: "Order added to previous orders" });
        }

        return res.status(400).json({ error: "Invalid action" });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.delete("/rest-order", async (req, res) => {
    try {
        const { restaurantName, id } = req.body;

        if (!restaurantName || !id) {
            return res.status(400).json({ error: "Restaurant name and order id is required for deletion" });
        }

        const updatedCurrentOrder = await currentRestOrders.deleteOne({
            restaurantName: restaurantName, id: id
        });

        if (updatedCurrentOrder.deletedCount === 0) {
            return res.status(404).json({ error: "Restaurant or order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });

    } catch (error) {
        console.error("Error updating orders:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.patch("/rest-order", async (req, res) => {
    try {
        const { restaurantName, id } = req.body;

        if (!restaurantName || !id) {
            return res.status(400).json({ error: "Restaurant name and order ID are required for status update" });
        }

        const updatedStatus = await currentRestOrders.findOneAndUpdate(
            { restaurantName: restaurantName, id: id },
            { $set: { status: "Accepted" } },
            { new: true }
        );

        const updatedStatus2 = await currentAcceptedCustomersOrders.findOneAndUpdate(
            { id: id },
            { $set: { status: "Order accepted by restaurant" } },
            { new: true }
        );

        if (!updatedStatus) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/rest-acc', async (req, res) => {
    try {
        const { name } = req.body;

        const user = await restDetails.findOne({ name });

        if (!user) {
            console.error('No user found for email:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/rest-earnings', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userDetails.findOne({ email });

        if (!user) {
            console.error('No user found for email:', email);
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ previousOrders: user.previousOrders});

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/delivery', async (req, res) => {
    const { action } = req.body;

    if (action == 1) {
        const { order } = req.body;

        try {
            const newOrder = new currentAcceptedDeliveryOrders(order);
            await newOrder.save();
            return res.sendStatus(200);
        }
        catch (error) {
            return res.sendStatus(400);
        }
    }

    else if (action == 2) {
        const { deliveryPartner } = req.body;
        try {
            const newOrder = await currentAcceptedDeliveryOrders.findOne({ deliveryPartner: deliveryPartner });
            return res.status(200).json(newOrder);
        }
        catch (error) {
            return res.sendStatus(400);
        }
    }

    else if (action == 3) {
        const { deliveryEmail, order, name } = req.body;
        try {
            await userDetails.updateOne(
                { email: deliveryEmail },
                {
                    $push: {
                        previousOrders: {
                            id: order.id,
                            orderDate: new Date().toLocaleDateString('en-CA'),
                            customerName: order.customerName,
                            restaurantName: order.restName,
                            orderDetails: order.orderDetails,
                            totalPrice: order.billTotal - order.deliveryFee,
                            deliveryFee: order.deliveryFee,
                            deliveryPartner: name,
                        }
                    }
                }
            );

            const user = await currentAcceptedCustomersOrders.findOne({id:order.id});
            const customerEmail = user.customerEmail;
            const paymentMethod = user.paymentMethod;

            await userDetails.updateOne(
                { email: customerEmail },
                {
                    $push: {
                        previousOrders: {
                            id: order.id,
                            orderDate: new Date().toLocaleDateString('en-CA'),
                            customerName: order.customerName,
                            restaurantName: order.restName,
                            orderDetails: order.orderDetails,
                            totalPrice: order.billTotal - order.deliveryFee,
                            deliveryFee: order.deliveryFee,
                            deliveryPartner: name,
                            paymentMethod: paymentMethod,
                        }
                    }
                }
            );

            return res.sendStatus(200);
        }
        catch (error) {
            return res.sendStatus(400);
        }
    }

    else if (action == 4) {
        const { email } = req.body;
        try {
            const user = await userDetails.findOne({ email });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(200).json(user.previousOrders || []);
        } catch (error) {
            console.error("Error fetching previous orders:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
});

app.get("/delivery", async (req, res) => {
    try {
        const deliveryOrders = await currentDeliveryOrders.find({});
        res.json(deliveryOrders);
    } catch (error) {
        res.status(500);
    }
});

app.delete("/delivery", async (req, res) => {
    const { action, id } = req.body; // Read action & id from query parameters

    try {
        let result;
        if (action === "1") {
            result = await currentDeliveryOrders.deleteOne({ id: id });
        } else if (action === "2") {
            result = await currentAcceptedDeliveryOrders.deleteOne({ id: id });
            const result2 = await currentAcceptedCustomersOrders.deleteOne({id: id});
        } else {
            return res.status(400).json({ error: "Invalid action parameter" });
        }

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.patch("/delivery", async (req, res) => {
    try {
        const { id, name, email } = req.body;

        const updatedStatus = await currentRestOrders.findOneAndUpdate(
            { id: id },
            { $set: { deliveryPartner: name } },
            { new: true }
        );

        const updatedStatus2 = await currentDeliveryOrders.findOneAndUpdate(
            { id: id },
            { $set: { deliveryPartner: name } },
            { new: true }
        );
        const contact = await userDetails.findOne({email:email});

        const updatedStatus3 = await currentAcceptedCustomersOrders.findOneAndUpdate(
            { id: id },
            { $set: { deliveryPartner: name,
                status: "Delivery partner assigned",
                deliveryPartnerContact: contact.phone,
             } 
            },
            { new: true }
        );

        if (!updatedStatus) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Create Razorpay Order
app.post('/create-order', async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount, // Amount in paisa (₹100 = 10000)
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
app.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'eatifydelivery@gmail.com',
        pass: process.env.NODEMAILER_PASS,
    },
});

app.post("/send-otp", async (req, res) => {
    try {
        const { email, orderId } = req.body;

        const order = await currentRestOrders.findOne({ id: orderId });

        if (order) {
            return res.status(404).json({ success: false, message: "Delivery has still not been handled by the restaurant" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await otps.deleteOne({ orderId: orderId });

        await otps.create({ orderId: Number(orderId), otp: Number(otp) });

        await transporter.sendMail({
            from: "eatifydelivery@gmail.com",
            to: email,
            subject: "Delivery OTP Verification",
            text: `Your OTP for order ${orderId} is: ${otp}. Please enter it to confirm delivery. It will expire in 5 minutes`,
        });

        return res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ success: false, message: "Failed to send OTP", error });
    }
});

app.post("/verify-otp", async (req, res) => {
    try {
        const { orderId, otp } = req.body;

        if (!orderId || !otp) {
            return res.status(400).json({ success: false, message: "Missing orderId or OTP!" });
        }

        const otpRecord = await otps.findOne({ orderId:Number(orderId)});

        if (!otpRecord) {
            console.error("OTP expired or not found!");
            return res.status(400).json({ success: false, message: "OTP expired or not generated!" });
        }

        if(Number(otpRecord.otp)==Number(otp))
        {
            await otps.deleteOne({ orderId: orderId });
            return res.status(200).json({ success: true, message: "OTP verified!" });
        }

        else {
            return res.status(400).json({ success: false, message: "Invalid OTP!" });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ success: false, message: "Failed to verify OTP", error });
    }
});

app.post("/user-prev-order", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userDetails.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching previous orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/user-curr-order", async (req, res) => {
    const { email } = req.body;
    try {
        const orders = await currentAcceptedCustomersOrders.find({ customerEmail: email });

        return res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching current orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => { console.log(`Server started at PORT: ${PORT}`) });
