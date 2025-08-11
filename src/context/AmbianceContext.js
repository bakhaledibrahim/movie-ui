// import React, { createContext, useState, useContext } from 'react';
//
// const AmbianceContext = createContext();
//
// export const useAmbiance = () => useContext(AmbianceContext);
//
// const genreColorMap = {
//     28: ['#1e3a8a', '#373737'], // Action -> Blue
//     12: ['#f59e0b', '#373737'], // Adventure -> Amber
//     16: ['#ec4899', '#373737'], // Animation -> Pink
//     35: ['#facc15', '#373737'], // Comedy -> Yellow
//     80: ['#7f1d1d', '#373737'], // Crime -> Dark Red
//     99: ['#6b7280', '#373737'], // Documentary -> Gray
//     18: ['#9a3412', '#373737'], // Drama -> Orange
//     14: ['#8b5cf6', '#373737'], // Fantasy -> Violet
//     27: ['#450a0a', '#373737'], // Horror -> Darker Red
//     9648: ['#065f46', '#373737'],// Mystery -> Green
//     878: ['#0e7490', '#373737'], // Sci-Fi -> Cyan
//     53: ['#1f2937', '#373737'], // Thriller -> Slate
// };
//
// const defaultAmbiance = ['#2c2c2c', '#373737', '#1e1e1e', '#373737'];
//
// export const AmbianceProvider = ({ children }) => {
//     const [ambiance, setAmbiance] = useState(defaultAmbiance);
//
//     const setAmbianceByGenre = (genreIds) => {
//         if (!genreIds || genreIds.length === 0) {
//             setAmbiance(defaultAmbiance);
//             return;
//         }
//         const primaryGenreId = genreIds.find(id => genreColorMap[id]);
//         setAmbiance(genreColorMap[primaryGenreId] || defaultAmbiance);
//     };
//
//     const clearAmbiance = () => {
//         setAmbiance(defaultAmbiance);
//     };
//
//     const value = { ambiance, setAmbianceByGenre, clearAmbiance };
//
//     return (
//         <AmbianceContext.Provider value={value}>
//             {children}
//         </AmbianceContext.Provider>
//     );
// };