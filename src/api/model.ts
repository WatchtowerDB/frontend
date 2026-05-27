import api from "./axiosInstance"

export const initModel = async () => {
  const response = await api.post("/api/compliance/model/init/")
  return response.data
}
