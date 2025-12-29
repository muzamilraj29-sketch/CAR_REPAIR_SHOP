import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

const api = {
  // Owners
  createOwner: (owner) => axios.post(`${API_URL}/owners/`, owner).then(res => res.data),
  getOwners: () => axios.get(`${API_URL}/owners/`).then(res => res.data),
  deleteOwner: (ownerId) => axios.delete(`${API_URL}/owners/${ownerId}`).then(res => res.data),

  // Cars
  createCar: (car) => axios.post(`${API_URL}/cars/`, car).then(res => res.data),
  getCars: () => axios.get(`${API_URL}/cars/`).then(res => res.data),

  // Owners + Cars combined (for frontend table)
  getOwnersWithCars: () => axios.get(`${API_URL}/owners-with-cars/`).then(res => res.data),

  // Labors – updated to send name + pay per labor
  addLabor: (labor) => axios.post(`${API_URL}/labors/`, labor).then(res => res.data),
  getLabors: (jobId) => axios.get(`${API_URL}/labors/${jobId}`).then(res => res.data),

  // Components
  addComponent: (component) => axios.post(`${API_URL}/components/`, component).then(res => res.data),
  getComponents: (jobId) => axios.get(`${API_URL}/components/${jobId}`).then(res => res.data),

  // Profit
  calculateProfit: (data) => axios.post(`${API_URL}/profit/`, data).then(res => res.data),

  // Fetch all labors + components + totals for a job
  getLaborsDetails: (jobId) => axios.get(`${API_URL}/labors-details/${jobId}`).then(res => res.data),

  // NEW: Fetch full job details including owner, car, labors, components, totals
  getJobFull: (jobId) => axios.get(`${API_URL}/job-full/${jobId}`).then(res => res.data),

  deleteFullJob: (jobId) => axios.delete(`${API_URL}/jobs-full/${jobId}`).then(res => res.data),
  getAllJobsFull: () => axios.get(`${API_URL}/jobs-full/`).then(res => res.data),


};

export default api;
