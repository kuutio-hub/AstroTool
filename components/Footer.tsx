
import React from 'react';

interface FooterProps {
    isNightMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isNightMode }) => {
    const currentYear = new Date().getFullYear();
    const version = '0.0.0.6.-beta';

    const textColor = isNightMode ? 'text-red-700' : 'text-gray-500';

    return (
        <footer className={`w-full text-center p-4 mt-8 border-t ${isNightMode ? 'border-red-800/50' : 'border-gray-700'}`}>
            <p className={`text-xs ${textColor}`}>
                &copy; {currentYear} Astro Companion | Verzió: {version}
            </p>
        </footer>
    );
};
