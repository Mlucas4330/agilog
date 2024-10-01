import { Box, Container, Flex, Heading, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function StatisticsPage() {
  const [loadingUC, setLoadingUC] = useState(true);
  const [loadingUCL, setLoadingUCL] = useState(true);
  const [chartDataUC, setChartDataUC] = useState(null);
  const [chartDataUCL, setChartDataUCL] = useState(null);

  const montaExcel = (dados, opcao) => {
    console.log(dados)
    if (opcao === "obrigacao") {
      const tabelaObrigacao = document.getElementById("tbodyObrigacoes");
      tabelaObrigacao.innerHTML = "";

      dados.forEach((item) => {
        const row = document.createElement("tr");

        const totalCienteCell = document.createElement("td");
        totalCienteCell.textContent = item.total_ciente || "";

        const totalNaoCienteCell = document.createElement("td");
        totalNaoCienteCell.textContent = item.total_nao_ciente || "";

        row.appendChild(totalCienteCell);
        row.appendChild(totalNaoCienteCell);

        tabelaObrigacao.appendChild(row);
      });
    } else if (opcao === "noticia") {
      const tabelaNoticia = document.getElementById("tbodyNoticias");
      tabelaNoticia.innerHTML = "";

      dados.forEach((item) => {
        const row = document.createElement("tr");

        const totalCienteCell = document.createElement("td");
        totalCienteCell.textContent = item.total_ciente || "";

        const totalNaoCienteCell = document.createElement("td");
        totalNaoCienteCell.textContent = item.total_nao_ciente || "";

        row.appendChild(totalCienteCell);
        row.appendChild(totalNaoCienteCell);

        tabelaNoticia.appendChild(row);
      });
    }
  };

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
          backgroundColor: ["#36A2EB", "#ff7e14"],
          hoverBackgroundColor: ["#36A2EB", "#ff7e14"],
        },
      ],
    };
    montaExcel(data, "noticia");
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
          backgroundColor: ["#36A2EB", "#ff7e14"],
          hoverBackgroundColor: ["#36A2EB", "#ff7e14"],
        },
      ],
    };
    montaExcel(data, "obrigacao");
    setChartDataUCL(formattedData);
    setLoadingUCL(false);
  };

  useEffect(() => {
    montaGraficoUC();
    montaGraficoUCL();
  }, []);

  const optionsUC = {
    plugins: {
      title: {
        display: true,
        text: "Restrições Legais",
        font: {
          size: 20,
        },
      },
    },
  };

  const optionsUCL = {
    plugins: {
      title: {
        display: true,
        text: "Restrições de Noticias de Trânsito",
        font: {
          size: 20,
        },
      },
    },
  };
  return (
    <>
      <div style={{ display: "none" }} id="table_excel">
        <table id="tbl_1">
          <thead>
            <tr>
              <th>Cientes</th>
              <th>Não Cientes</th>
            </tr>
          </thead>
          <tbody id="tbodyNoticias"></tbody>
        </table>
      </div>
      <div style={{ display: "none" }} id="table_excel2">
        <table id="tbl_2">
          <thead>
            <tr>
              <th>Cientes</th>
              <th>Não Cientes</th>
            </tr>
          </thead>
          <tbody id="tbodyObrigacoes"></tbody>
        </table>
      </div>
      <Container maxW={"container.xxl"} minHeight={"100vh"}>
        <Heading as={"h1"} color={"#207155"} fontWeight={"300"} mt={5}>
          AGILOG
        </Heading>
        <Flex mt={5} justify={"space-evenly"} align={"center"}>
          <Box>
            {loadingUC ? (
              <Spinner />
            ) : (
              <Pie data={chartDataUC} options={optionsUC} />
            )}
          </Box>
          <Box>
            {loadingUCL ? (
              <Spinner />
            ) : (
              <Pie data={chartDataUCL} options={optionsUCL} />
            )}
          </Box>
        </Flex>
      </Container>
    </>
  );
}

export default StatisticsPage;
