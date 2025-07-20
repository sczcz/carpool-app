import React from 'react';
import { Box, Heading, Link, Flex, Image } from '@chakra-ui/react';
import LilyBlueIcon from '../assets/lily-blue.svg';

const Header = () => {
    return (
        <Box as="header" bg="white" p={4}>
            <Flex alignItems="center" justifyContent="center">
                <Link 
                    href="https://www.scouterna.se" 
                    isExternal 
                    color="brand.500"
                    fontSize="lg" 
                    fontWeight="bold"
                    display={["none", "none", "flex"]}
                    alignItems="center" 
                    mr={8}
                >
                    Scouterna
                    <Image 
                        src={LilyBlueIcon} 
                        alt="External Link" 
                        ml={2} 
                        boxSize="1.5em" 
                    />
                </Link>

                <Link 
                    href="/" 
                    style={{ textDecoration: 'none' }}
                    textAlign="center"
                >
                    <Heading 
                        as="h1" 
                        size="xl" 
                        color="brand.500" 
                        fontFamily="'Pacifico', cursive" 
                        fontWeight="400"
                    >
                        Jonstorps Kustscoutkår
                    </Heading>
                </Link>
            </Flex>
        </Box>
    );
};

export default Header;
