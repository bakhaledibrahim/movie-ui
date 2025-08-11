import { useState, useCallback } from 'react';

const REMINDER_LIST_KEY = 'vidflix_reminder_list';

export const useReminders = () => {
    const [reminders, setReminders] = useState(() => {
        try {
            const list = localStorage.getItem(REMINDER_LIST_KEY);
            return list ? JSON.parse(list) : [];
        } catch (error) {
            console.error("Error reading reminder list from local storage:", error);
            return [];
        }
    });

    const addReminder = useCallback((media) => {
        setReminders(prevList => {
            const newList = [...prevList, media];
            localStorage.setItem(REMINDER_LIST_KEY, JSON.stringify(newList));
            return newList;
        });
    }, []);

    const removeReminder = useCallback((mediaId) => {
        setReminders(prevList => {
            const newList = prevList.filter(item => item.id !== mediaId);
            localStorage.setItem(REMINDER_LIST_KEY, JSON.stringify(newList));
            return newList;
        });
    }, []);

    const hasReminder = useCallback((mediaId) => {
        return reminders.some(item => item.id === mediaId);
    }, [reminders]);

    return { reminders, addReminder, removeReminder, hasReminder };
};