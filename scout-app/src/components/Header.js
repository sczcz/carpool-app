import React from 'react';
import { Box, Heading, Link, Flex, Image } from '@chakra-ui/react';
import LilyBlueIcon from '../assets/lily-blue.svg';

const Header = () => {
    return (
        <Box as="header" bg="white" p={4}>
            <Flex justifyContent="space-between" alignItems="center">
                <Link 
                    href="https://www.scouterna.se" 
                    isExternal 
                    color="brand.500" // Change text color to match previous background color
                    fontSize="lg" 
                    fontWeight="bold"
                    display={["none", "none", "inline-flex"]} // Hide on all screens except desktop
                    alignItems="center" // Vertically centers them
                >
                    Scouterna
                    <Image 
                        src={LilyBlueIcon} // Use your imported SVG
                        alt="External Link" 
                        ml={2} // Adds left margin between text and icon
                        boxSize="1.5em" // Adjust the size of the icon as needed
                    />
                </Link>

                <Link 
                    href="/" // This should match the path of the old "Hem" link
                    style={{ textDecoration: 'none' }} // Remove underline from link
                    flexGrow={1} // Allow this to take up the remaining space
                >
                    <Heading 
                        as="h1" 
                        size="xl" 
                        color="brand.500" // Change text color to match previous background color
                        fontFamily="'Pacifico', cursive" 
                        fontWeight="400"
                        textAlign="center" // Center text alignment
                        mr={20} // Add horizontal margin to adjust positioning
                    >
                        Jonstorps Kustscoutkår
                    </Heading>
                </Link>
            </Flex>
        </Box>
    );
};

export default Header;

