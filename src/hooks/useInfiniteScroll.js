import { useState, useCallback, useRef } from 'react';

export const useInfiniteScroll = (apiFunc) => {
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const response = await apiFunc(pageRef.current);
            setItems(prev => [...prev, ...response.data.results]);

            const morePagesExist = response.data.page < response.data.total_pages;
            hasMoreRef.current = morePagesExist;
            setHasMore(morePagesExist);

            pageRef.current += 1;
        } catch (error) {
            console.error("Failed to fetch more items", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [apiFunc]);

    const reset = useCallback(() => {
        setItems([]);
        pageRef.current = 1;
        hasMoreRef.current = true;
        setHasMore(true);
    }, []);

    return { items, hasMore, loading, loadMore, reset };
};