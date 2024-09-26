import { Container, Heading, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  const montaGrafico = async () => {
    setLoading(true);
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/countUsuariosCientes.php"
    );

    const data = await response.json();
    
    const { total_ciente, total_nao_ciente } = data[0];

    const formattedData = {
      labels: ["Ciente", "Não Ciente"],
      datasets: [
        {
          data: [total_ciente, total_nao_ciente],
          backgroundColor: ["#36A2EB", "#FF6384"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384"],
        },
      ],
    };

    setChartData(formattedData);
    setLoading(false);
  };

  useEffect(() => {
    montaGrafico();
  }, []);

  return (
    <>
      <Container
        maxW={"container.xxl"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        minHeight={"100vh"}
      >
        <Heading as={"h1"} color={"#207155"} fontWeight={"300"} mt={5}>
          AGILOG
        </Heading>
        <div style={{ width: "30%", height: "30%"}}>
        {loading ? (
          <Spinner size="xl" mt={10} />
        ) : (
          <Pie data={chartData}  />
        )}
        </div>
      </Container>
    </>
  );
}

export default StatisticsPage;
