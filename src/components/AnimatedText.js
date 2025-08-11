import React from 'react';
import { motion } from 'framer-motion';

// This component will animate any text passed to it, letter by letter.
const AnimatedText = ({ text, el: Wrapper = 'h3', className }) => {
    const letters = Array.from(text);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.035, delayChildren: i * 0.04 }, // Slightly faster stagger
        }),
    };

    const childVariants = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <Wrapper
            // THE FIX IS HERE: Replaced 'overflow-hidden' with 'flex-wrap'
            className={`flex flex-wrap ${className}`}
        >
            <motion.span
                variants={containerVariants}
                initial="hidden"
                // The 'animate' prop will be triggered every time the 'text' changes
                animate="visible"
                key={text} // Adding a key ensures the animation re-triggers when the text changes
            >
                {letters.map((letter, index) => (
                    <motion.span key={index} variants={childVariants}>
                        {letter === ' ' ? '\u00A0' : letter}
                    </motion.span>
                ))}
            </motion.span>
        </Wrapper>
    );
};

export default AnimatedText;