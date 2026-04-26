import api from '../api';

export const fetchWishlist = async () => {
  const { data } = await api.get('/wishlist');
  return data.data;
};

export const addToWishlist = async (productId: string) => {
  const { data } = await api.post(`/wishlist/${productId}`);
  return data;
};

export const removeFromWishlist = async (productId: string) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
};

export const fetchMyOrders = async () => {
  const { data } = await api.get('/orders/my-orders');
  return data.data;
};

export const fetchOrderById = async (id: string) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
};

export const fetchAddresses = async () => {
  const { data } = await api.get('/user/addresses');
  return data.data;
};

export const addAddress = async (address: any) => {
  const { data } = await api.post('/user/addresses', address);
  return data.data;
};

export const updateAddress = async (id: string, address: any) => {
  const { data } = await api.put(`/user/addresses/${id}`, address);
  return data.data;
};

export const deleteAddress = async (id: string) => {
  const { data } = await api.delete(`/user/addresses/${id}`);
  return data;
};
