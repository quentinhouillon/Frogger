import React from 'react';
import type { Lane as LaneType } from "../types/GameTypes";

interface LaneProps {
  data: LaneType;
}

const Lane: React.FC<LaneProps> = ({ data }) => {
  const getLaneColor = () => {
    switch (data.laneType) {
      case "ROAD":
        return "#4b5563";
      case "RIVER":
        return "#3b82f6";
      case "SAFE":
        return "#22c55e";
      case "WATERLITY_BUSH":
        return "#1fae53";
      default:
        return "#9ca3af";
    }
  };

  const getLaneEmoji = () => {
    switch (data.laneType) {
      case "ROAD":
        return "🛣️";
      case "RIVER":
        return "🌊";
      case "SAFE":
        return "🌿";
      case "WATERLITY_BUSH":
        return "🪷";
      default:
        return "";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: data.positionY,
        width: data.width,
        height: 50,
        backgroundColor: getLaneColor(),
      }}
      className="flex items-center"
    >
      <span className="ml-2 text-xl">{getLaneEmoji()}</span>
    </div>
  );
};

export default Lane;