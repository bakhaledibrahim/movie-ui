import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaPlus } from 'react-icons/fa';

const activities = [
    { action: "is watching", icon: <FaEye />, location: "Tokyo" },
    { action: "added to their list", icon: <FaPlus />, location: "London" },
    { action: "is watching", icon: <FaEye />, location: "New York" },
    { action: "added to their list", icon: <FaPlus />, location: "Paris" },
];

const LiveActivityFeed = ({ popularItems }) => {
    const [activity, setActivity] = useState(null);

    useEffect(() => {
        const showRandomActivity = () => {
            if (popularItems.length > 0) {
                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                const randomItem = popularItems[Math.floor(Math.random() * popularItems.length)];
                setActivity({ ...randomActivity, item: randomItem });

                setTimeout(() => {
                    setActivity(null);
                }, 5000); // Hide after 5 seconds
            }
        };

        const interval = setInterval(showRandomActivity, 10000); // Show a new activity every 10 seconds
        return () => clearInterval(interval);
    }, [popularItems]);

    return (
        <div className="fixed bottom-5 left-5 z-50">
            <AnimatePresence>
                {activity && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="bg-black/70 backdrop-blur-md border border-white/20 rounded-lg p-3 flex items-center space-x-3 shadow-lg"
                    >
                        <div className="text-red-500">{activity.icon}</div>
                        <div>
                            <p className="text-sm text-white">
                                Someone in <span className="font-bold">{activity.location}</span> {activity.action}
                            </p>
                            <p className="text-xs text-gray-400 font-semibold">{activity.item.title || activity.item.name}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveActivityFeed;