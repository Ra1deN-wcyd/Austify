import { useState, useEffect } from 'react';
import * as postApi from '../api/posts';

export const usePosts = () => {
    const [posts, setPosts] = useState([]);

    const loadPosts = async () => {
        const data = await postApi.fetchPosts();
        setPosts(data);
    };

    const createPost = async (content) => {
        const newPost = await postApi.createPost(content);
        setPosts([newPost, ...posts]);
    };

    const toggleLike = async (id) => {
        const res = await postApi.toggleLike(id);
        setPosts(posts.map(p => p.id === id ? { ...p, likes_count: res.likes_count } : p));
    };

    const deletePost = async (id) => {
        await postApi.deletePost(id);
        setPosts(posts.filter(p => p.id !== id));
    };

    useEffect(() => { loadPosts(); }, []);

    return { posts, loadPosts, createPost, toggleLike, deletePost };
};