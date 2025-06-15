import { useParams, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load game components
const NumberMemoryGame = lazy(() =>
  import("../components/games/NumberMemoryGame")
);
const TileMemoryGame = lazy(() => import("../components/games/TileMemoryGame"));
const AlphaNumMemoryGame = lazy(() =>
  import("../components/games/AlphaNumMemoryGame")
);
const SchulteTableGame = lazy(() =>
  import("../components/games/SchulteTableGame")
);
const DoubleSchulteGame = lazy(() =>
  import("../components/games/DoubleSchulteGame")
);
const MathSystemsGame = lazy(() =>
  import("../components/games/MathSystemsGame")
);
const GcdLcmGame = lazy(() => import("../components/games/GcdLcmGame"));
const FractionsGame = lazy(() => import("../components/games/FractionsGame"));
const PercentagesGame = lazy(() =>
  import("../components/games/PercentagesGame")
);
const ReadingSpeedGame = lazy(() =>
  import("../components/games/ReadingSpeedGame")
);
const HideAndSeekGame = lazy(() =>
  import("../components/games/HideAndSeekGame")
);

const GamePlay = () => {
  const { gameType } = useParams();

  // Game type validation
  const validGameTypes = [
    "numberMemory",
    "tileMemory",
    "alphaNumMemory",
    "schulteTable",
    "doubleSchulte",
    "mathSystems",
    "gcdLcm",
    "fractions",
    "percentages",
    "readingSpeed",
    "hideAndSeek",
  ];

  if (!validGameTypes.includes(gameType)) {
    return <Navigate to="/games" replace />;
  }

  // Render appropriate game component
  const renderGame = () => {
    switch (gameType) {
      case "numberMemory":
        return <NumberMemoryGame />;
      case "tileMemory":
        return <TileMemoryGame />;
      case "alphaNumMemory":
        return <AlphaNumMemoryGame />;
      case "schulteTable":
        return <SchulteTableGame />;
      case "doubleSchulte":
        return <DoubleSchulteGame />;
      case "mathSystems":
        return <MathSystemsGame />;
      case "gcdLcm":
        return <GcdLcmGame />;
      case "fractions":
        return <FractionsGame />;
      case "percentages":
        return <PercentagesGame />;
      case "readingSpeed":
        return <ReadingSpeedGame />;
      case "hideAndSeek":
        return <HideAndSeekGame />;
      default:
        return <Navigate to="/games" replace />;
    }
  };

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="large" text="O'yin yuklanmoqda..." />
          </div>
        }
      >
        {renderGame()}
      </Suspense>
    </div>
  );
};

export default GamePlay;
