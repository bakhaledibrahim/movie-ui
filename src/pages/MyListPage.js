import React, { useState, useEffect } from 'react';
import { useMyList } from '../hooks/useMyList';
import * as api from '../api/tmdb';
import CarouselCard from '../components/CarouselCard';
import DetailsModal from '../components/DetailsModal';

const MyListPage = () => {
    const { myList } = useMyList();
    const [detailedList, setDetailedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const detailedItems = await Promise.all(
                myList.map(async (item) => {
                    try {
                        const response = item.media_type === 'movie'
                            ? await api.fetchMovieDetails(item.id)
                            : await api.fetchTvShowDetails(item.id);
                        return { ...response.data, media_type: item.media_type };
                    } catch {
                        return null;
                    }
                })
            );
            setDetailedList(detailedItems.filter(Boolean));
            setLoading(false);
        };
        fetchDetails();
    }, [myList]);

    const openModal = (media) => setSelectedMedia(media);
    const closeModal = () => setSelectedMedia(null);

    return (
        <div className="pt-24 px-4 md:px-12">
            <h1 className="text-4xl font-bold mb-8">My List</h1>
            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {detailedList.map((item) => (
                        <div key={item.id} className="w-full h-60 md:h-72">
                            <CarouselCard item={item} onClick={() => openModal(item)} />
                        </div>
                    ))}
                </div>
            )}
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} />}
        </div>
    );
};

export default MyListPage;