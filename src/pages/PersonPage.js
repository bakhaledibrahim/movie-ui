import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api/tmdb';
import CarouselCard from '../components/CarouselCard';
import DetailsModal from '../components/DetailsModal';

const PersonPage = () => {
    const { personId } = useParams();
    const [personDetails, setPersonDetails] = useState(null);
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const fetchPersonData = async () => {
            setLoading(true);
            try {
                const creditsRes = await api.fetchPersonCredits(personId);
                const sortedCredits = creditsRes.data.cast.sort((a, b) => b.popularity - a.popularity);
                setCredits(sortedCredits);
                if (creditsRes.data.cast.length > 0) {
                    setPersonDetails({ name: creditsRes.data.cast[0].name });
                }
            } catch (error) {
                console.error("Failed to fetch person data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonData();
    }, [personId]);

    const openModal = (media) => setSelectedMedia(media);
    const closeModal = () => setSelectedMedia(null);

    return (
        <div className="pt-24 px-4 md:px-12">
            {loading ? <p>Loading...</p> : (
                <>
                    <h1 className="text-4xl font-bold mb-8">Known For: {personDetails?.name}</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {credits.filter(c => c.poster_path).map((item) => (
                            <div key={`${item.id}-${item.credit_id}`} className="w-full h-60 md:h-72">
                                <CarouselCard item={item} onClick={() => openModal(item)} />
                            </div>
                        ))}
                    </div>
                </>
            )}
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} />}
        </div>
    );
};

export default PersonPage;