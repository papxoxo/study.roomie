import { io } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URL;
export const socket = io(URL, {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem("jwt");
    cb({ token });
  }
});
