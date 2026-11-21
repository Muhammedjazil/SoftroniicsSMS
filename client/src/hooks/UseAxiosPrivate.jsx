import { useEffect } from "react";
import { axiosPrivate } from "../Axios";

const useAxiosPrivate = () => {
  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (config.data instanceof FormData) {
          config.headers["Content-Type"] = "multipart/form-data";
        } else {
          config.headers["Content-Type"] = "application/json";
        }

        if (!config.headers["Authorization"]) {
          const token = localStorage.getItem("SMStoken");
          if (token) {
            config.headers["Authorization"] = token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem("SMStoken");
          localStorage.removeItem("user");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, []);

  return axiosPrivate;
};

export default useAxiosPrivate;