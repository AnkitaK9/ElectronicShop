import express from "express";
import expressAsyncHandler from "express-async-handler";
import DeliveryPerson from "../models/deliveryPersonModel.js";
import Order from "../models/orderModel.js";
import { generateToken, isAuth } from "../utils.js";
import bcrypt from "bcryptjs";

const deliveryRouter = express.Router();

// Seed delivery persons
deliveryRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    // Your logic to seed delivery persons
  })
);

// Sign in delivery person
deliveryRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const deliveryPerson = await DeliveryPerson.findOne({ email });

    if (
      deliveryPerson &&
      bcrypt.compareSync(password, deliveryPerson.password)
    ) {
      res.send({
        _id: deliveryPerson._id,
        name: deliveryPerson.name,
        email: deliveryPerson.email,
        token: generateToken(deliveryPerson),
      });
    } else {
      res.status(401).send({ message: "Invalid email or password." });
    }
  })
);

// Register a new delivery person
deliveryRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, location, vehicleInfo } =
      req.body;
    const deliveryPerson = new DeliveryPerson({
      name,
      email,
      password: bcrypt.hashSync(password, 8),
      phoneNumber,
      location,
      vehicleInfo,
    });

    const createdDeliveryPerson = await deliveryPerson.save();
    res.status(201).send({
      _id: createdDeliveryPerson._id,
      name: createdDeliveryPerson.name,
      email: createdDeliveryPerson.email,
      token: generateToken(createdDeliveryPerson),
    });
  })
);

// Update delivery person profile
deliveryRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const deliveryPerson = await DeliveryPerson.findById(req.user._id);
    if (deliveryPerson) {
      deliveryPerson.name = req.body.name || deliveryPerson.name;
      deliveryPerson.email = req.body.email || deliveryPerson.email;
      if (req.body.password) {
        deliveryPerson.password = bcrypt.hashSync(req.body.password, 8);
      }
      deliveryPerson.phoneNumber =
        req.body.phoneNumber || deliveryPerson.phoneNumber;
      deliveryPerson.location = req.body.location || deliveryPerson.location;
      deliveryPerson.vehicleInfo =
        req.body.vehicleInfo || deliveryPerson.vehicleInfo;
      const updatedDeliveryPerson = await deliveryPerson.save();
      res.send({
        _id: updatedDeliveryPerson._id,
        name: updatedDeliveryPerson.name,
        email: updatedDeliveryPerson.email,
        token: generateToken(updatedDeliveryPerson),
      });
    }
  })
);

// Fetch assigned orders for a delivery person
deliveryRouter.get(
  "/:deliveryPersonId/orders",
  expressAsyncHandler(async (req, res) => {
    const { deliveryPersonId } = req.params;
    const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
    if (!deliveryPerson) {
      res.status(404).send({ message: "Delivery person not found" });
      return;
    }
    const assignedOrders = await Order.find({
      _id: { $in: deliveryPerson.assignedOrders },
    });
    res.send(assignedOrders);
  })
);

// Mark an order as delivered

deliveryRouter.put(
  "/orders/:orderId/mark-delivered",
  expressAsyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { deliveredAt } = req.body;
    
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).send({ message: "Order not found" });
        return;
      }

      // Mark the order as delivered
      order.isDelivered = true;
      order.deliveredAt = deliveredAt;
      const updatedOrder = await order.save();

      // // Remove the order from assignedOrders array of the delivery person
      // const deliveryPerson = await DeliveryPerson.findOneAndUpdate(
      //   { assignedOrders: orderId },
      //   { $pull: { assignedOrders: orderId } }
      // );

      // if (!deliveryPerson) {
      //   res.status(404).send({ message: "Delivery person not found" });
      //   return;
      // }

      res.send({ message: "Order marked as delivered", order: updatedOrder });
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  })
);



export default deliveryRouter;
