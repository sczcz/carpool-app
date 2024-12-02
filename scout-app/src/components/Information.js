import React from 'react';
import { Box, Heading, Text, VStack, List, ListItem, Link } from '@chakra-ui/react';

const Information = () => {
  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack align="start" spacing={4}>
        <Heading as="h1" size="xl" color="brand.600">
          Integritetspolicy för Alltid Redo
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Senast uppdaterad: 2024-12-02
        </Text>
        
        <Heading as="h2" size="lg" color="brand.600">
          Vilken information samlar vi in?
        </Heading>
        <Text>
          Vi samlar endast in personuppgifter som är nödvändiga för att:
        </Text>
        <List pl={4} styleType="disc">
          <ListItem>Skapa och hantera användarkonton.</ListItem>
          <ListItem>Möjliggöra inloggning och autentisering.</ListItem>
          <ListItem>Tillhandahålla tjänsten på ett säkert sätt.</ListItem>
        </List>
        <Text>Detta inkluderar:</Text>
        <List pl={4} styleType="disc">
          <ListItem>E-postadress</ListItem>
          <ListItem>Namn</ListItem>
          <ListItem>Lösenord (lagrat som en säker hash)</ListItem>
        </List>
        
        <Heading as="h2" size="lg" color="brand.600">
          Användning av cookies
        </Heading>
        <Text>Vi använder cookies för att:</Text>
        <List pl={4} styleType="disc">
          <ListItem>Hålla användare inloggade under en session.</ListItem>
          <ListItem>Säkerställa att användare är autentiserade för att använda tjänsten.</ListItem>
        </List>
        <Text>
          Dessa cookies är nödvändiga för tjänstens funktion och innehåller ingen personlig information som används för marknadsföring eller analys.
        </Text>
        
        <Heading as="h2" size="lg" color="brand.600">
          Delning av data
        </Heading>
        <Text>
          Vi delar aldrig dina personuppgifter med tredje parter, utom när det krävs enligt lag.
        </Text>
        
        <Heading as="h2" size="lg" color="brand.600">
          Hur länge lagrar vi data?
        </Heading>
        <Text>
          Dina personuppgifter lagras så länge du har ett konto hos oss. Om du avslutar ditt konto raderas dina uppgifter permanent.
        </Text>
        
        <Heading as="h2" size="lg" color="brand.600">
          Dina rättigheter
        </Heading>
        <Text>Du har rätt att:</Text>
        <List pl={4} styleType="disc">
          <ListItem>Begära tillgång till de uppgifter vi har om dig.</ListItem>
          <ListItem>Begära rättelse av felaktiga uppgifter.</ListItem>
          <ListItem>Begära att dina uppgifter raderas ("rätten att bli bortglömd").</ListItem>
          <ListItem>Begränsa eller invända mot behandling av dina uppgifter.</ListItem>
          <ListItem>Begära dataportabilitet.</ListItem>
        </List>
        <Text>
          För att utöva dessa rättigheter, vänligen kontakta oss på <Link color="teal.500" href="mailto:alltidredo@kustscoutjonstorp.se">alltidredo@kustscoutjonstorp.se</Link>.
        </Text>
        
        <Heading as="h2" size="lg" color="brand.600">
          Kontakta oss
        </Heading>
        <Text>
          Om du har frågor om hur vi behandlar dina uppgifter kan du kontakta oss:
        </Text>
        <Text>
          E-post: <Link color="teal.500" href="mailto:alltidredo@kustscoutjonstorp.se">alltidredo@kustscoutjonstorp.se</Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Information;
