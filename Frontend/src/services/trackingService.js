import api from "./api";

export const getShipmentByTrackingNumber = async (trackingNumber) => {
  const response = await api.get(
    `/api/shipments/track/${encodeURIComponent(trackingNumber)}`
  );

  return response.data;
};

export const getTrackingDetails = async (shipmentId) => {
  const response = await api.get(
    `/api/shipments/${shipmentId}/tracking`
  );

  return response.data;
};

export const getCurrentLocation = async (shipmentId) => {
  const response = await api.get(
    `/api/shipments/${shipmentId}/location`
  );

  return response.data;
};

export const getLocationHistory = async (shipmentId) => {
  const response = await api.get(
    `/api/shipments/${shipmentId}/location-history`
  );

  return response.data;
};