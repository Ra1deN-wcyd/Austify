import { useState } from 'react';
import * as userApi from '../api/user';

export const useUsers = () => {
    const [results, setResults] = useState([]);

    const search = async (name) => {
        const data = await userApi.searchUsers(name);
        setResults(data);
    };

    return { results, search };
};