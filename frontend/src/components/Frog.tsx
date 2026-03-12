import React from 'react';
import type { Frog as FrogType } from "../types/GameTypes"; 

// 1. Définition des props attendues
interface FrogProps {
    data: FrogType 
}

// 2. Le composant
const Frog: React.FC<FrogProps> = ({ data }) => {
    return (
        <div style={{
            position: 'absolute',
            left: data.x,
            top: data.y,
            width: data.width,
            height: data.height,
            backgroundColor: 'lime',
            borderRadius: '50%'
        }} className="flex items-center justify-center">
            🐸
        </div>
    );
};

export default Frog;