import axiosClient from "./axiosClient";

const todoApi = {
  // --- Các hàm bạn đã viết (Giữ nguyên) ---
  getTodos: (params) => axiosClient.get("/todos", { params }),
  getTodoById: (id) => axiosClient.get(`/todos/${id}`),
  createTodo: (data) => axiosClient.post("/todos", data),
  updateTodo: (id, data) => axiosClient.put(`/todos/${id}`, data),
  deleteTodo: (id) => axiosClient.delete(`/todos/${id}`),
  completeTodo: (id) => axiosClient.patch(`/todos/${id}/complete`),
  
  updatePriority: (id, priority_id) =>
    axiosClient.patch(`/todos/${id}/priority`, { priority_id }),

  updateCategory: (id, category_id) =>
    axiosClient.patch(`/todos/${id}/category`, { category_id }),

  // --- BỔ SUNG THÊM (Để đổ dữ liệu vào dropdown) ---
  getCategories: () => axiosClient.get("/categories"),
  getPriorities: () => axiosClient.get("/priorities"),
  
  // --- LOGS ---
  getLogs: () => {
    return axiosClient.get('/logs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }, 

  clearLogs: () => {
    return axiosClient.delete('/logs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  },

  deleteLog: (id) => {
    return axiosClient.delete(`/logs/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};

  
export default todoApi;