import React from 'react';
export const TimeSlider = ({ selectedHour, onHourChange }) => {
    // Utility function to format the 24-hour time to a readable string
    const formatHour = (hour) => {
        const h = parseInt(hour, 10);
        if (h === -1) return "All Hours (Total Risk)"; 
        if (h === 0) return "12:00 AM (Midnight)";
        if (h === 12) return "12:00 PM (Noon)";
        if (h < 12) return `${h}:00 AM`;
        return `${h - 12}:00 PM`;
    };

    return (
        <div 
            className="bg-white p-4 rounded-xl shadow-2xl border-b-4 border-indigo-500 z-10"
            style={{
                position: 'absolute',
                top: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%', // Fluid width on mobile
                maxWidth: '400px', // Max width on desktop
            }}
        >
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
                Ticket Risk at: <span className="text-indigo-600">{formatHour(selectedHour)}</span>
            </h3>
            <input
                type="range"
                min="-1"
                max="23"
                step="1"
                value={selectedHour}
                onChange={(e) => onHourChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg transition-all duration-300"
                style={{
                    '--tw-ring-color': '#4F46E5', // Indigo-600
                }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span className="font-bold">TOTAL</span> 
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
            </div>
        </div>
    );
};

export default TimeSlider;