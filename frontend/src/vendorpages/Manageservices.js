import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/Manageservices.css";

const API = "http://localhost:4001";

const ManageServices = () => {
  const vendorSignin = useSelector((state) => state.vendorSignin);
  const { vendorInfo } = vendorSignin;

  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(
          API + `/api/vendors/${vendorInfo._id}/services`
        );
        setServices(response.data);
      } catch (error) {
        console.error(
          "Error fetching services:",
          error.response.data.message || error.message
        );
      }
    };

    if (vendorInfo) {
      fetchServices();
    }
  }, [vendorInfo]);

  const handleMarkAsCompleted = async (serviceId) => {
    console.log(serviceId);
    const confirmed = window.confirm(
      "Are you sure you want to mark this service as completed?"
    );
    if (confirmed) {
      try {
        const response = await axios.put(
          API + `/api/services/${serviceId}/complete`
        );
        console.log(response);
        const updatedService = response.data;
        console.log(updatedService);// Assuming the updated service data is returned from the server
        setServices((prevServices) =>
          prevServices.map((service) =>
            service._id === serviceId ? updatedService : service
          )
        );
      } catch (error) {
        console.error("Error marking service as completed:", error.message);
      }
    }
  };

  return (
    <div className="services-container">
      <h1>Manage Services</h1>
      <div className="services-list">
        {services.map((service) => (
          <div key={service._id} className="service-card">
            <div className="service-details">
              <h3>Service ID: {service._id}</h3>
              <p>Total Price: ${service.totalPrice}</p>
            </div>
            <div className="button-container">
              <Link to={`/service/${service._id}`} className="service-link">
                View Details
              </Link>
              {service.isDone ? (
                <span className="done-text">Done</span>
              ) : (
                <button
                  onClick={() => handleMarkAsCompleted(service._id)}
                  className="mark-done-btn"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageServices;
