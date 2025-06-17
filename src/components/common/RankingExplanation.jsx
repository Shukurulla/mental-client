// components/common/RankingExplanation.jsx
import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  Divider,
  Alert,
} from "antd";
import {
  FaTrophy,
  FaCalculator,
  FaInfoCircle,
  FaChartLine,
} from "react-icons/fa";

const { Title, Text, Paragraph } = Typography;

const RankingExplanation = ({ gameType = "overall", userStats = null }) => {
  const getFormulaExplanation = () => {
    if (gameType === "overall") {
      return {
        title: "Umumiy Reyting Formulasi",
        formula:
          "Reyting = (Umumiy Ball × 0.5) + (Daraja × 150) + (O'yinlar × 3) + (O'rtacha Ball × 0.3) + (Seriya × 10)",
        components: [
          {
            name: "Umumiy Ball",
            weight: "50%",
            description: "Barcha o'yinlarda to'plagan umumiy ballaringiz",
            color: "blue",
          },
          {
            name: "Daraja",
            weight: "×150",
            description: "Hozirgi darajangiz (1000 ball = 1 daraja)",
            color: "green",
          },
          {
            name: "O'yinlar soni",
            weight: "×3",
            description: "O'ynagan o'yinlaringiz soni (faollik)",
            color: "orange",
          },
          {
            name: "O'rtacha ball",
            weight: "30%",
            description: "Har bir o'yindagi o'rtacha natijangiz",
            color: "purple",
          },
          {
            name: "Kun serialari",
            weight: "×10",
            description: "Ketma-ket kunlar o'ynash (maksimal faollik)",
            color: "red",
          },
        ],
      };
    } else {
      return {
        title: "O'yin Reytingi Formulasi",
        formula:
          "Reyting = (Eng Yaxshi Ball × 0.6) + (O'rtacha Ball × 0.3) + (O'yinlar × 5)",
        components: [
          {
            name: "Eng yaxshi ball",
            weight: "60%",
            description: "Bu o'yinda eng yuqori natijangiz",
            color: "blue",
          },
          {
            name: "O'rtacha ball",
            weight: "30%",
            description: "Bu o'yindagi o'rtacha natijangiz",
            color: "green",
          },
          {
            name: "O'yinlar soni",
            weight: "×5",
            description: "Bu o'yinni qancha marta o'ynagansiz",
            color: "orange",
          },
        ],
      };
    }
  };

  const calculateUserRanking = () => {
    if (!userStats) return null;

    const formula = getFormulaExplanation();

    if (gameType === "overall") {
      const totalScore = userStats.totalScore || 0;
      const level = userStats.level || 1;
      const gamesPlayed = userStats.gamesPlayed || 0;
      const averageScore = userStats.averageScore || 0;
      const streak = userStats.streak || 0;

      const components = [
        {
          name: "Umumiy Ball",
          value: totalScore,
          multiplier: 0.5,
          result: totalScore * 0.5,
        },
        { name: "Daraja", value: level, multiplier: 150, result: level * 150 },
        {
          name: "O'yinlar",
          value: gamesPlayed,
          multiplier: 3,
          result: gamesPlayed * 3,
        },
        {
          name: "O'rtacha",
          value: averageScore,
          multiplier: 0.3,
          result: averageScore * 0.3,
        },
        { name: "Seriya", value: streak, multiplier: 10, result: streak * 10 },
      ];

      const totalRanking = components.reduce(
        (sum, comp) => sum + comp.result,
        0
      );

      return { components, totalRanking };
    } else {
      // Game-specific calculation would go here
      return null;
    }
  };

  const formula = getFormulaExplanation();
  const userCalculation = calculateUserRanking();

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <FaInfoCircle className="text-blue-500" />
          <Title level={4} className="mb-0">
            {formula.title}
          </Title>
        </div>
        <Alert
          message={formula.formula}
          type="info"
          className="font-mono text-sm"
          showIcon={false}
        />
      </div>

      <Row gutter={[16, 16]}>
        {/* Formula Components */}
        <Col xs={24} lg={userStats ? 12 : 24}>
          <Title level={5} className="mb-4">
            <FaCalculator className="mr-2" />
            Formula komponentlari
          </Title>

          <div className="space-y-3">
            {formula.components.map((component, index) => (
              <div key={index} className="p-3 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <Text strong className="text-gray-800">
                    {component.name}
                  </Text>
                  <Tag color={component.color}>{component.weight}</Tag>
                </div>
                <Text className="text-sm text-gray-600">
                  {component.description}
                </Text>
              </div>
            ))}
          </div>
        </Col>

        {/* User's Calculation */}
        {userStats && userCalculation && (
          <Col xs={24} lg={12}>
            <Title level={5} className="mb-4">
              <FaChartLine className="mr-2" />
              Sizning hisobingiz
            </Title>

            <div className="space-y-3 mb-4">
              {userCalculation.components.map((comp, index) => (
                <div key={index} className="p-3 rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>{comp.name}</Text>
                    <Text className="font-mono">
                      {comp.value.toLocaleString()} × {comp.multiplier} ={" "}
                      {Math.round(comp.result).toLocaleString()}
                    </Text>
                  </div>
                  <Progress
                    percent={Math.min(
                      (comp.result / (userCalculation.totalRanking || 1)) * 100,
                      100
                    )}
                    strokeColor="#3b82f6"
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </div>

            <Divider />

            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <Text className="text-gray-600">Jami reyting balingiz</Text>
              <div className="text-3xl font-bold text-blue-600 mt-1">
                {Math.round(userCalculation.totalRanking).toLocaleString()}
              </div>
              <Text className="text-sm text-gray-500 mt-1">
                Bu ball sizning reytingdagi o'rningizni belgilaydi
              </Text>
            </div>
          </Col>
        )}
      </Row>

      {/* Additional Tips */}
      <Divider />

      <div className="mt-4">
        <Title level={5} className="mb-3">
          <FaTrophy className="mr-2 text-yellow-500" />
          Reytingni oshirish yo'llari
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <Text strong className="text-yellow-800">
                🎯 Yuqori ball to'plash
              </Text>
              <div className="text-sm text-yellow-700 mt-1">
                Har bir o'yinda eng yaxshi natijaga erishishga harakat qiling
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <Text strong className="text-green-800">
                📅 Muntazam o'ynash
              </Text>
              <div className="text-sm text-green-700 mt-1">
                Har kuni o'ynab, kun serialarini oshiring
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Text strong className="text-blue-800">
                🏃‍♂️ Daraja oshirish
              </Text>
              <div className="text-sm text-blue-700 mt-1">
                1000 ball = 1 daraja. Darajangiz oshsa, reyting ko'p oshadi
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12}>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <Text strong className="text-purple-800">
                📈 O'rtachani yaxshilash
              </Text>
              <div className="text-sm text-purple-700 mt-1">
                Har bir o'yinda izchil natija ko'rsating
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default RankingExplanation;
