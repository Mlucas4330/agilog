import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaFileExcel, FaHome } from "react-icons/fa";
import { FaCog } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Button, Flex } from "@chakra-ui/react";
import { getEmpresa } from "../pages/App";

function Menu() {
  const getConexaoFromURL = () => {
    let search = window.location.search;

    // Verifica se há o formato errado e corrige a string
    if (search.includes("?conexao?=")) {
      search = search.replace("?conexao?=", "?conexao=");
    }

    const params = new URLSearchParams(search);
    return params.get("conexao");
  };

  const navigate = useNavigate();

  const paginaEstatistica = () => {
    navigate("/estatisticas");
  };

  const paginaInicial = () => {
    navigate("/");
  };

  const sair = () => {
    const conexao = getConexaoFromURL();
    const url = `https://www.legnet.com.br/legnet/phpforms/layout/index.php?conexao=${conexao}`;
    window.location.href = url;
};

  const geraExcel = () => {
    const empresa = getEmpresa();
    const tabelaNoticias = document.getElementById("tbl_1");
    const tabelaObrigacoes = document.getElementById("tbl_2");

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const nomeEmpresa = empresa;

    const inserirCabecalho = (tabela) => {
      const cabecalho = tabela.createTHead();
      const linhaCabecalho = cabecalho.insertRow(0);

      const celulaNomeEmpresa = linhaCabecalho.insertCell(0);
      celulaNomeEmpresa.colSpan = tabela.rows[0].cells.length;
      celulaNomeEmpresa.style.textAlign = "left";
      celulaNomeEmpresa.innerHTML = `<strong>${nomeEmpresa}</strong>`;

      const celulaDataAtual = linhaCabecalho.insertCell(1);
      celulaDataAtual.colSpan = tabela.rows[0].cells.length;
      celulaDataAtual.style.textAlign = "right";
      celulaDataAtual.innerHTML = `<strong>Data: ${dataAtual}</strong>`;

      const linhaVazia1 = tabela.insertRow(1);
      const celulaVazia1 = linhaVazia1.insertCell(0);
      celulaVazia1.colSpan = tabela.rows[0].cells.length;

      const linhaVazia2 = tabela.insertRow(2);
      const celulaVazia2 = linhaVazia2.insertCell(0);
      celulaVazia2.colSpan = tabela.rows[0].cells.length;
    };

    inserirCabecalho(tabelaNoticias);
    inserirCabecalho(tabelaObrigacoes);

    const wb = XLSX.utils.book_new();

    const wsNoticias = XLSX.utils.table_to_sheet(tabelaNoticias);
    XLSX.utils.book_append_sheet(wb, wsNoticias, "Noticias");

    const wsObrigacoes = XLSX.utils.table_to_sheet(tabelaObrigacoes);
    XLSX.utils.book_append_sheet(wb, wsObrigacoes, "Obrigacoes");

    XLSX.writeFile(wb, "tabelas.xlsx");
  };

  const menus = [
    {
      label: "Inicio",
      icon: <FaHome />,
      action: () => paginaInicial(),
    },
    {
      label: "Gerar Excel",
      icon: <FaFileExcel />,
      action: () => geraExcel(),
    },
    {
      label: "Dashboard",
      icon: <FaFileAlt />,
      action: () => paginaEstatistica(),
    },
    {
      label: "Sair",
      icon: <FaTimesCircle />,
      action: () => sair(),
    },
  ];

  return (
    <Flex justifyContent={"center"} gap={5} mt={5}>
      {menus.map((menu, index) => (
        <Button
          key={index}
          w={"200px"}
          size={"lg"}
          bgColor="#2F9B7C"
          colorScheme="green"
          leftIcon={menu.icon}
          onClick={menu.action}
        >
          {menu.label}
        </Button>
      ))}
    </Flex>
  );
}

export default Menu;
