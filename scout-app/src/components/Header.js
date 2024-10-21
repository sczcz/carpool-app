import React from 'react';
import { Box, Heading, Link, Flex, Image } from '@chakra-ui/react';
import LilyBlueIcon from '../assets/lily-blue.svg';

const Header = () => {
    return (
        <Box as="header" bg="white" p={4}>
            <Flex alignItems="center" justifyContent="center">
                {/* Scouterna Link on the left with margin */}
                <Link 
                    href="https://www.scouterna.se" 
                    isExternal 
                    color="brand.500"
                    fontSize="lg" 
                    fontWeight="bold"
                    display={["none", "none", "flex"]} // Hide on mobile and tablet screens
                    alignItems="center" 
                    mr={8} // Adjust this margin to move it further left, as it was on the left side
                >
                    Scouterna
                    <Image 
                        src={LilyBlueIcon} 
                        alt="External Link" 
                        ml={2} 
                        boxSize="1.5em" 
                    />
                </Link>

                {/* Main Title */}
                <Link 
                    href="/" 
                    style={{ textDecoration: 'none' }} // Remove underline from link
                    textAlign="center" // Center text alignment
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
