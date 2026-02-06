import axiosInstance from './axios'

export const loginUser = async (data) => {
    const response = await axiosInstance.post('/auth/login', data)
    return response.data
}