import { useState, useCallback } from 'react';

const MY_LIST_KEY = 'vidflix_my_list';

export const useMyList = () => {
    const [myList, setMyList] = useState(() => {
        try {
            const list = localStorage.getItem(MY_LIST_KEY);
            return list ? JSON.parse(list) : [];
        } catch (error) {
            return [];
        }
    });

    const addToList = useCallback((media) => {
        setMyList(prevList => {
            const newList = [...prevList, media];
            localStorage.setItem(MY_LIST_KEY, JSON.stringify(newList));
            return newList;
        });
    }, []);

    const removeFromList = useCallback((mediaId) => {
        setMyList(prevList => {
            const newList = prevList.filter(item => item.id !== mediaId);
            localStorage.setItem(MY_LIST_KEY, JSON.stringify(newList));
            return newList;
        });
    }, []);

    const isInList = useCallback((mediaId) => {
        return myList.some(item => item.id === mediaId);
    }, [myList]);

    return { myList, addToList, removeFromList, isInList };
};