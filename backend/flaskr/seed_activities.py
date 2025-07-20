from datetime import datetime, timedelta
import random
from extensions import db
from models.activity_model import Activity

def seed_activities():
    activity_names = [
        "Knivkurs för Äventyrare",
        "Lägereldskväll",
        "Naturvandring med Kutar",
        "Paddling på sjön",
        "Kartläsning för Upptäckare",
        "Knopkurs för Utmanare",
        "Stjärnskådning",
        "Säkerhetsövning i skogen",
        "Bygga vindskydd",
        "Orienteringstävling",
        "Matlagning över öppen eld",
        "Lägerbyggnad för Tumlare",
        "Dykning i havsvik",
        "Kulturutflykt",
        "Cykeltur längs kusten",
        "Miljöstädning av stranden",
        "Hinderbaneträning",
        "Fisketur med napp",
        "Fotomaraton i skogen",
        "Knyta scoutband",
        "Teambuilding-dag",
        "Scoutlägerhelg",
        "Bivack-övning",
        "Stormköksmästerskap",
        "Utflykt till fågelreservat",
        "Kanotorientering",
        "Fjällvandring",
        "Vattensportdag",
        "Grillning med tävling",
        "Höstvandring i nationalpark"
    ]

    addresses = [
        "Scoutstugan, Skogsvägen 12", "Fjällvägen 45", "Kustscouternas Bas, Havsgatan 8",
        "Skogshöjden 33", "Naturreservatet Ängarna", "Campingplatsen vid Storsjön",
        "Strandvägen 22", "Åsberget 14", "Lägerängen vid Björkbacken"
    ]
    descriptions = [
        "En rolig och lärorik aktivitet.", "Kom och lär dig något nytt!", 
        "En chans att utvecklas och ha kul.", "Scoutövning med fokus på teamwork.",
        "Lär dig mer om natur och friluftsliv.", "En dag fylld av äventyr!",
        """Under denna aktivitet kommer vi att utforska skogen och lära oss om olika trädarter. 
        Vi börjar dagen med en spännande skattjakt följt av naturmålning. Lunch serveras ute i 
        det fria, och på eftermiddagen bygger vi kojor. Avslutningsvis kommer vi att tända en 
        lägereld och sjunga sånger tillsammans innan vi går hem. Ta med kläder efter väder, 
        vattenflaska och en liten ryggsäck.""",

        """Följ med oss på en lärorik dag vid havet! Vi samlas tidigt för att studera djurlivet 
        i vattnet, där vi letar efter små krabbor och musslor. Efteråt kommer vi att lära oss 
        grundläggande navigering med hjälp av karta och kompass. Lunch äter vi vid strandkanten, 
        följt av en tävling i sandslottsbygge. Dagen avslutas med en gruppövning där vi tar 
        reda på hur havets ekosystem fungerar.""",

        """Dagen börjar med en vandring uppför berget där vi stannar vid olika stationer för 
        att lära oss om flora och fauna i området. Efter lunch kommer vi att prova på klättring 
        med utbildade instruktörer, följt av en kort kurs i första hjälpen. Kvällen avslutas med 
        en mysig middag vid lägerplatsen, där vi delar historier och lär känna varandra bättre.""",

        """En spännande dag väntar där vi lär oss paddla kanot i lugna vattendrag. Efter en 
        introduktion paddlar vi ut och stannar vid en ö där vi äter lunch. Under eftermiddagen har 
        vi teambuildingövningar på stranden och övar säkerhet vid vatten. Dagen avslutas med en 
        tävling där grupperna paddlar i olika banor.""",

        """Vi samlas för att tillsammans arbeta med miljöprojektet 'Håll naturen ren'. Dagen består 
        av att samla skräp i skog och mark, följt av en workshop om återvinning och hållbarhet. 
        Efter lunchen deltar vi i gruppdiskussioner om hur vi kan minska vår miljöpåverkan. Vi 
        avslutar dagen med att skapa konstverk av återvunnet material.""",

        """Under denna aktivitet fokuserar vi på överlevnad i naturen. Förmiddagen består av att 
        bygga vindskydd och lära sig tända eld utan tändstickor. Efter lunch lär vi oss hur man 
        renar vatten och hittar ätbara växter i skogen. Vi avslutar med en överlevnadstävling där 
        deltagarna i grupper använder de kunskaper de lärt sig under dagen.""",

        """En dag för att stärka lagandan! Vi börjar med att dela in oss i grupper och delta i 
        olika stationer, inklusive hinderbanor, samarbetsövningar och problemlösning. Efter lunch 
        har vi en aktivitet där vi skapar ett gemensamt konstverk som representerar vår grupp. 
        Dagen avslutas med en medaljceremoni där alla får diplom för sina insatser.""",

        """Denna dag handlar om historia och kultur. Vi samlas vid en gammal fästning och lär oss 
        om dess historia genom en guidad tur. Efter lunch deltar vi i en workshop där vi lär oss 
        om gamla hantverk som vävning och smide. På eftermiddagen deltar vi i en historisk 
        rollspelsaktivitet där vi klär ut oss och återskapar scener från fästningens historia."""
    ]

    roles = [3, 4, 5, 6, 7]

    # Generate activities
    activities = []
    for _ in range(30):
        name = random.choice(activity_names)
        random_start_hour = random.randint(6, 18)
        random_start_minute = random.choice([0, 15, 30, 45])
        start_date = datetime(2025, 1, 20) + timedelta(
            days=random.randint(0, 254),
            hours=random_start_hour,
            minutes=random_start_minute
        )
        end_date = start_date + timedelta(hours=random.randint(2, 6))
        role_id = random.choice(roles)
        address = random.choice(addresses)
        description = random.choice(descriptions)
        is_visible = random.choice([True, False])

        activity = Activity(
            name=name,
            start_date=start_date,
            end_date=end_date,
            role_id=role_id,
            address=address,
            description=description,
            is_visible=is_visible
        )
        activities.append(activity)

    db.session.bulk_save_objects(activities)
    db.session.commit()