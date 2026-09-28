import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Tracking.css";

import {
  getShipmentByTrackingNumber,
  getTrackingDetails,
} from "../services/trackingService";

function Tracking() {
  const [searchParams] = useSearchParams();

  const initialNumber =
    searchParams.get("trackingNumber") || "STP-2026-00007";

  const [trackingNumber, setTrackingNumber] = useState(initialNumber);
  const [searchedNumber, setSearchedNumber] = useState(initialNumber);

  const [shipment, setShipment] = useState(null);
  const [trackingData, setTrackingData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch shipment + tracking information
  const fetchTrackingData = async (number) => {
    try {
      setLoading(true);
      setError("");

      // STEP 1: Get shipment using tracking number
      const shipmentData = await getShipmentByTrackingNumber(number);

      console.log("Shipment Data:", shipmentData);

      setShipment(shipmentData);

      // STEP 2: Get complete tracking information using shipment ID
      const trackingDetails = await getTrackingDetails(shipmentData.id);

      console.log("Tracking Data:", trackingDetails);

      setTrackingData(trackingDetails);
    } catch (err) {
      console.error("Tracking API Error:", err);

      setShipment(null);
      setTrackingData(null);

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Shipment not found. Status: ${err.response.status}`
        );
      } else {
        setError(
          "Unable to connect to the backend. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Load default shipment when page opens
  useEffect(() => {
    fetchTrackingData(initialNumber);
  }, [initialNumber]);

  const handleSearch = async (e) => {
    e.preventDefault();

    const number = trackingNumber.trim();

    if (!number) {
      setError("Please enter a tracking number.");
      return;
    }

    setSearchedNumber(number);

    await fetchTrackingData(number);
  };

  // Helper function for formatting dates
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Convert backend status into readable text
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const locationHistory = trackingData?.locationHistory || [];

  return (
    <div className="tracking-page">
      {/* SIDEBAR */}
      <aside className="tracking-sidebar">
        <div className="tracking-logo">
          <div className="tracking-logo-icon">S</div>

          <div>
            <h2>ShipTrack</h2>
            <span>PRO</span>
          </div>
        </div>

        <div className="tracking-menu-title">CUSTOMER</div>

        <nav>
          <Link to="/dashboard/customer" className="tracking-nav-link">
            <span>⌂</span>
            Overview
          </Link>

          <Link to="/shipments/active" className="tracking-nav-link">
            <span>▣</span>
            Active Shipments
          </Link>

          <Link to="/shipments/history" className="tracking-nav-link">
            <span>◷</span>
            Shipment History
          </Link>

          <Link to="/tracking" className="tracking-nav-link active">
            <span>⌖</span>
            Tracking
          </Link>

          <Link to="/notifications" className="tracking-nav-link">
            <span>♢</span>
            Notifications
          </Link>

          <Link to="/tracking-insights" className="tracking-nav-link">
            <span>▥</span>
            Tracking Insights
          </Link>
        </nav>

        <div className="tracking-sidebar-bottom">
          <Link to="/login" className="tracking-logout">
            ⇥ Logout
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="tracking-main">
        <header className="tracking-header">
          <div>
            <div className="tracking-breadcrumb">
              Customer / Tracking
            </div>

            <h1>Track Shipment</h1>

            <p>
              Follow your shipment location, delivery status and ETA.
            </p>
          </div>

          <div className="tracking-avatar">R</div>
        </header>

        {/* SEARCH */}
        <section className="tracking-search-card">
          <div>
            <span className="tracking-search-label">
              TRACKING NUMBER
            </span>

            <h2>Where is your shipment?</h2>
          </div>

          <form onSubmit={handleSearch} className="tracking-search-form">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Track Shipment"}
            </button>
          </form>
        </section>

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderRadius: "12px",
              background: "rgba(255, 80, 80, 0.10)",
              border: "1px solid rgba(255, 80, 80, 0.30)",
              color: "#ff7b7b",
            }}
          >
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              textAlign: "center",
              color: "#aaa",
            }}
          >
            Loading shipment tracking information...
          </div>
        )}

        {/* SHIPMENT */}
        {!loading && shipment && trackingData && (
          <>
            <section className="tracking-panel">
              <div className="tracking-panel-header">
                <div>
                  <span>TRACKING ID</span>
                  <h2>
                    {shipment.trackingNumber || searchedNumber}
                  </h2>
                </div>

                <div className="tracking-live">
                  <span></span>
                  LIVE TRACKING
                </div>
              </div>

              {/* STATUS */}
              <div className="tracking-current-status">
                <div className="tracking-status-icon">✓</div>

                <div>
                  <span>Current Status</span>

                  <h2>
                    {formatStatus(shipment.status)}
                  </h2>

                  <p>
                    Shipment is currently{" "}
                    {formatStatus(shipment.status).toLowerCase()}.
                  </p>
                </div>

                <div className="tracking-eta">
                  <span>CURRENT LOCATION</span>

                  <strong>
                    {trackingData.currentLocation?.locationName ||
                      "Not available"}
                  </strong>

                  <small>
                    Updated{" "}
                    {formatDateTime(
                      trackingData.currentLocation?.recordedAt
                    )}
                  </small>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="tracking-timeline">
                {locationHistory.length > 0 ? (
                  locationHistory.map((location, index) => (
                    <div key={location.id}>
                      <div
                        className={`timeline-step ${
                          index === locationHistory.length - 1
                            ? "current"
                            : "completed"
                        }`}
                      >
                        <div className="timeline-dot">
                          {index === locationHistory.length - 1
                            ? "●"
                            : "✓"}
                        </div>

                        <div>
                          <strong>
                            {location.locationName ||
                              "Location Update"}
                          </strong>

                          <span>
                            {formatDateTime(location.recordedAt)}
                          </span>

                          <span>
                            Coordinates:{" "}
                            {location.latitude},{" "}
                            {location.longitude}
                          </span>
                        </div>
                      </div>

                      {index < locationHistory.length - 1 && (
                        <div className="timeline-line"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      color: "#aaa",
                    }}
                  >
                    No location history available.
                  </div>
                )}
              </div>
            </section>

            {/* DETAILS */}
            <section className="tracking-details-grid">
              <div className="tracking-detail-card">
                <span>ORIGIN</span>

                <strong>
                  {shipment.senderAddress || "Not available"}
                </strong>

                <small>
                  Sender: {shipment.senderName || "Not available"}
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>DESTINATION</span>

                <strong>
                  {shipment.receiverAddress || "Not available"}
                </strong>

                <small>
                  Receiver:{" "}
                  {shipment.receiverName || "Not available"}
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>PACKAGE</span>

                <strong>
                  {shipment.packageDescription ||
                    "Package"}
                </strong>

                <small>
                  {shipment.packageWeightKg ?? "N/A"} kg
                </small>
              </div>

              <div className="tracking-detail-card">
                <span>SHIPMENT ID</span>

                <strong>
                  #{shipment.id}
                </strong>

                <small>
                  Created:{" "}
                  {formatDateTime(shipment.createdAt)}
                </small>
              </div>
            </section>
          </>
        )}

        <footer className="tracking-footer">
          © 2026 ShipTrack Pro · Integrated Logistics Intelligence Platform
        </footer>
      </main>
    </div>
  );
}

export default Tracking;