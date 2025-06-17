import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Button } from "antd";
import { FaArrowLeft } from "react-icons/fa";

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
const FlashAnzanGame = lazy(() => import("../components/games/FlashAnzanGame"));
const FlashCardsGame = lazy(() => import("../components/games/FlashCardsGame"));

const GamePlay = () => {
  const { gameType } = useParams();
  const navigate = useNavigate();

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
    "flashAnzan",
    "flashCards",
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
      case "flashAnzan":
        return <FlashAnzanGame />;
      case "flashCards":
        return <FlashCardsGame />;
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
        <Button variant="outlined" onClick={() => navigate("/games")}>
          <FaArrowLeft /> Orqaga
        </Button>
        {renderGame()}
      </Suspense>
    </div>
  );
};

export default GamePlay;
