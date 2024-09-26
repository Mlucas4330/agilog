import { Box } from "@chakra-ui/react"

function Footer() {
    return (
        <Box
            mt={5}
            p={"50px 30px"}
            textAlign={"right"}
            color={"white"}
            bgColor={"white"}
            background={"url(https://legnet.com.br/img/shape-pe.png) top right"}
        >
            <strong>© LegNET</strong>
        </Box>
    )
}

export default Footer