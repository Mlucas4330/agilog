import { Box, Container, Flex, Heading, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function StatisticsPage() {
  const [loadingUC, setLoadingUC] = useState(true);
  const [loadingUCL, setLoadingUCL] = useState(true);
  const [chartDataUC, setChartDataUC] = useState(null);
  const [chartDataUCL, setChartDataUCL] = useState(null);

  const montaGraficoUC = async () => {
    setLoadingUC(true);
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

    setChartDataUC(formattedData);
    setLoadingUC(false);
  };

  const montaGraficoUCL = async () => {
    setLoadingUCL(true);
    const response = await fetch(
      "https://www.legnet.com.br/legnet/api/agilog/countUsuariosCientesLeis.php"
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

    setChartDataUCL(formattedData);
    setLoadingUCL(false);
  }

  useEffect(() => {
    montaGraficoUC();
    montaGraficoUCL();
  }, []);

  return (
    <>
      <Container maxW={"container.xxl"} minHeight={"100vh"}>
        <Heading as={"h1"} color={"#207155"} fontWeight={"300"} mt={5}>
          AGILOG
        </Heading>
        <Flex mt={5} justify={'space-evenly'} align={'center'}>
          <Box>
            {loadingUC ? <Spinner /> : <Pie data={chartDataUC} />}
          </Box>
          <Box>
            {loadingUCL ? <Spinner /> : <Pie data={chartDataUCL} />}
          </Box>
        </Flex>
      </Container>
    </>
  );
}

export default StatisticsPage;
