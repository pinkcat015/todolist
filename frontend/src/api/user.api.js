import axiosClient from "./axiosClient";

const userApi = {
  // 1. Cập nhật hồ sơ (Có upload ảnh - Bắt buộc dùng FormData và Header multipart)
  updateProfile: (data) => {
    return axiosClient.put('/users/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // 2. Đổi mật khẩu
  changePassword: (data) => {
    return axiosClient.put('/users/change-password', data);
  },
};

export default userApi;