import { Avatar, Button, Flex, Image, Text, Link } from "@chakra-ui/react"
import { getEmpresa } from '../pages/App';

function Header() {
      const empresa = getEmpresa();
    return (
        <Flex bgColor={'#2F9B7C'} alignItems={'center'} justify={'space-between'}>
            <Flex alignItems={'center'} gap={5}>
                <Image src="https://legnet.com.br/favicon.png" w={'54px'} height={'auto'} p={'5px 0 5px 14px'} />
                <Text color={'white'}><strong>Legnet</strong> 2.0</Text>
            </Flex>
            <Button bgColor="#2F9B7C" colorScheme="green" leftIcon={<Avatar size='xs' />}>{empresa}</Button>
        </Flex>
    )
}

export default Header