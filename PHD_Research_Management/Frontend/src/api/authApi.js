import axios from "./axios";

export const loginUser = async (credentials) => {
    const res = await axios.post('/auth/login', credentials);

    return res.data;
}