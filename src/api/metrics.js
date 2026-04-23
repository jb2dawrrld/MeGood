import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

export const getMetrics = async (userId, date) => {
  const res = await axios.get(`${API_BASE}/metrics`, {
    params: { userId, date },
  });
  return res.data;
};

export const updateMetrics = async (userId, data) => {
  const res = await axios.post(`${API_BASE}/metrics`, { userId, ...data });
  return res.data;
};

export const getHeartRate = async () => {
  const res = await axios.get(`${API_BASE}/metrics/heart-rate-stream`);
  return res.data;
};