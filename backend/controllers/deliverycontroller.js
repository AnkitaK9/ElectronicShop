// Import necessary models
import Order from "../models/orderModel.js";
import DeliveryPerson from "../models/deliveryPersonModel.js";

// Function to assign orders to delivery persons based on least assigned orders
export const assignOrderToDeliveryPerson = async (orderId, shippingCity) => {
  try {
    // Find all delivery persons who match the shipping city
    const deliveryPersons = await DeliveryPerson.find({
      location: shippingCity,
    });

    if (deliveryPersons.length === 0) {
      console.log(
        `No available delivery person for the shipping city: ${shippingCity}`
      );
      return;
    }

    // Sort delivery persons based on the number of assigned orders (ascending)
    deliveryPersons.sort(
      (a, b) => a.assignedOrders.length - b.assignedOrders.length
    );

    // Assign the order to the delivery person with the least assigned orders
    const chosenDeliveryPerson = deliveryPersons[0];

    // Update the order document with the assigned delivery person
    await Order.findByIdAndUpdate(orderId, {
      deliveryPerson: chosenDeliveryPerson._id,
    });

    // Update the assignedOrders array of the chosen delivery person
    chosenDeliveryPerson.assignedOrders.push(orderId);
    await chosenDeliveryPerson.save();

    console.log(
      `Order ${orderId} assigned to Delivery Person ${chosenDeliveryPerson.name}`
    );
  } catch (error) {
    console.error("Error assigning orders to delivery persons:", error);
  }
};
