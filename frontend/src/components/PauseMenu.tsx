import React, { useState, useEffect } from "react";

const PauseMenu = () => {

  const [isPaused, setIsPaused] = useState(false);

  // Touche ESC
  useEffect(() => {
    const handlePause = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener("keydown", handlePause);

    return () => {
      window.removeEventListener("keydown", handlePause);
    };
  }, []);

  return (
    <>
      {/* MENU PAUSE */}
      {isPaused && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#222",
              padding: "40px",
              color: "white",
              textAlign: "center",
              borderRadius: "10px",
            }}
          >
            <h1>⏸ PAUSE</h1>

            <button onClick={() => setIsPaused(false)}>
              ▶ Reprendre
            </button>

            <br />
            <br />

            <button onClick={() => window.location.reload()}>
              🔄 Recommencer
            </button>

            <br />
            <br />

            <button>
              🏠 Quitter
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default PauseMenu;
