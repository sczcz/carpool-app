import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

const Header = () => {
    return (
        <Box as="header" bg="brand.500" p={4} textAlign="center">
            <Heading as="h1" size="xl" color="white">
                JONSTORPS KUSTSCOUTKÅR
            </Heading>
        </Box>
    );
};

export default Header;
