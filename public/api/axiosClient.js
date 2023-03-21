const axiosClient = axios.create({
    // baseURL: process.env.API_URL || 'https://clone-zalo-api.herokuapp.com',
    headers: {
        'content-type': 'application/json',
    },
    // paramsSerializer: params => QueryString.stringify(params)
});
axiosClient.interceptors.request.use(async (config) => {
    // Handle token here ...
    return config;
});
axiosClient.interceptors.response.use(
    (response) => {
        if (response && response.data) {
            return response.data;
        }
        return response;
    },
    (error) => {
        // Handle errors
        throw error;
    }
);

