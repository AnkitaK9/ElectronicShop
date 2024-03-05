import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { markOrderAsDelivered } from "../actions/orderActions";
import "../styles/deliveryHome.css";

const API = "http://localhost:4001"; 
const DeliveryHome = () => {
  const [assignedOrders, setAssignedOrders] = useState([]);

  const dispatch = useDispatch();

  // Fetch assigned orders for the current delivery person
  const deliverySignin = useSelector((state) => state.deliverySignin);
  const { deliveryInfo, loading, error } = deliverySignin;

  useEffect(() => {
    if (deliveryInfo) {
      // Make an API call to fetch assigned orders
      fetchAssignedOrders();
    }
  }, [deliveryInfo]);

  const fetchAssignedOrders = async () => {
    try {
      const response = await fetch(
        API + `/api/delivery/${deliveryInfo._id}/orders`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch assigned orders");
      }
      const data = await response.json();
      setAssignedOrders(data);
    } catch (error) {
      console.error("Error fetching assigned orders:", error);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      // Make an API call to mark the order as delivered
      const response = await fetch(API + `/api/delivery/orders/${orderId}/mark-delivered`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveredAt: new Date(),
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to mark order as delivered");
      }
      // Remove the delivered order from the assigned orders list
      setAssignedOrders(
        assignedOrders
      );
    } catch (error) {
      console.error("Error marking order as delivered:", error);
    }
  };

  const handleMarkAsPaid = async (orderId, isPaid) => {
    try {

      const confirmDelivered = window.confirm(
        "Are you sure you want to mark this order as delivered?"
      );
      if (!confirmDelivered) {
        return; // If the user cancels, exit the function
      }
      // Make an API call to mark the order as paid
      const response = await fetch(
        API + `/api/delivery/orders/${orderId}/mark-paid`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paidAt: new Date(),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to mark order as paid");
      }
      // Update the order's paid status locally
      setAssignedOrders(assignedOrders);
    } catch (error) {
      console.error("Error marking order as paid:", error);
    }
  };

  return (
    <div className="total">
      <h2>Assigned Orders</h2>
      <div className="order-cards">
        {assignedOrders.map((order) => (
          <div className="order-card" key={order._id}>
            <p>Order ID: {order._id}</p>
            <p>Address: {order.shippingAddress.address}</p>
            <p>Status: {order.isDelivered}</p>
            <button
              onClick={() =>
                handleMarkAsDelivered(order._id, order.isDelivered)
              }
            >
              {order.isDelivered ? "Delivered" : "Mark as Delivered"}
            </button>
            {order.paymentMethod === "cod" && !order.isPaid && (
              <button onClick={() => handleMarkAsPaid(order._id, order.isPaid)}>
                Mark as Paid
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryHome;
