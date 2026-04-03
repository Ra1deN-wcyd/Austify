import api from './api';

export const fetchPosts = async () => {
  const res = await api.get('/post/wall');
  return res.data;
};

export const createPost = async (content) => {
  const res = await api.post('/post/create-post', { content });
  return res.data.post;
};

export const toggleLike = async (id) => {
  const res = await api.post(`/post/like/${id}`);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await api.delete(`/post/delete/${id}`);
  return res.data;
};