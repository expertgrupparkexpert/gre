
import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 rounded-lg">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="mt-4 text-lg text-gray-200 font-semibold">{message}</p>
        </div>
    );
};

export default Loader;
