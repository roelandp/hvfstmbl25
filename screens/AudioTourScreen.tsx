import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, AudioSource, AudioStatus } from 'expo-audio';
import { theme } from '../theme';
import { generateAudioTourMapHTML } from '../utils/mapTileGenerator';
import { parseGPX } from '../utils/gpxParser';
import { useGlobalLocation } from '../contexts/LocationContext';


interface AudioStop {
  id: string;
  title: string;
  script_text: string;
  lat: number;
  lon: number;
}

const { width } = Dimensions.get('window');

export default function AudioTourScreen() {
  const [stops, setStops] = useState<AudioStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapHTML, setMapHTML] = useState<string>('');
  const [currentStop, setCurrentStop] = useState<AudioStop | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const webViewRef = useRef<WebView>(null);

  // State to hold the parsed GPX route data
  const [gpxRoute, setGpxRoute] = useState<{ lat: number; lon: number }[]>([]);

  const { location, showUserLocation, isTracking, hasPermission, toggleLocationTracking } = useGlobalLocation();

  const player = useAudioPlayer();

  useEffect(() => {
    // Load audio stops and initial GPX data
    const loadData = async () => {
      await loadAudioStops();

      // Load and parse GPX data
      try {
        // Use the actual GPX content from the file
        const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="chatgpt" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>KL Walking Tour - Combined Tracks</name>
    <time>2025-08-29T10:49:22.630111Z</time>
  </metadata>
  <trk>
    <name>KL Walking Tour Track 1 (LineString)</name>
    <trkseg>
      <trkpt lat="3.1401900" lon="101.6982000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1403500" lon="101.6981100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1403800" lon="101.6980700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1403900" lon="101.6980400"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1404000" lon="101.6979800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1404500" lon="101.6979900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1405100" lon="101.6980100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1405900" lon="101.6980200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1406700" lon="101.6980200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1411100" lon="101.6980200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1411700" lon="101.6980100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1412200" lon="101.6975900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1412600" lon="101.6973500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1413000" lon="101.6971500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1413200" lon="101.6971100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1413400" lon="101.6971000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1413500" lon="101.6970900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1413700" lon="101.6970800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1413900" lon="101.6970700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1414200" lon="101.6970600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1414500" lon="101.6970600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1416000" lon="101.6970900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1415800" lon="101.6973200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1415600" lon="101.6975500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1414000" lon="101.6975700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1412200" lon="101.6975900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1411700" lon="101.6980100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1412400" lon="101.6980100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1415100" lon="101.6979900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1416500" lon="101.6979700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1424900" lon="101.6978900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1425300" lon="101.6973800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1425600" lon="101.6971700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1426600" lon="101.6964800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1430600" lon="101.6965500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1431800" lon="101.6965700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1433000" lon="101.6965800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1435500" lon="101.6965900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1436100" lon="101.6966000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1443600" lon="101.6966100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1443800" lon="101.6962200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1443900" lon="101.6961600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1444000" lon="101.6957400"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1445300" lon="101.6957400"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1446900" lon="101.6957700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1452200" lon="101.6957700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1454100" lon="101.6957800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1455000" lon="101.6957900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1457000" lon="101.6958000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1458500" lon="101.6958200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1460100" lon="101.6958600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1460500" lon="101.6958600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1468200" lon="101.6959800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1469000" lon="101.6959800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1473600" lon="101.6959800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1475100" lon="101.6959900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1476300" lon="101.6960100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1476800" lon="101.6960200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1478400" lon="101.6960800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1479500" lon="101.6960100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1479900" lon="101.6959900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1480700" lon="101.6959600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1480900" lon="101.6959600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1481100" lon="101.6959600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1481400" lon="101.6959700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1481500" lon="101.6959800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1485300" lon="101.6962800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1485900" lon="101.6963200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1487300" lon="101.6963900"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1487700" lon="101.6964200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1488000" lon="101.6964500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1488200" lon="101.6964700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1490400" lon="101.6965500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1490800" lon="101.6965800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1491100" lon="101.6966200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1491300" lon="101.6966300"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1497600" lon="101.6960800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1499200" lon="101.6959300"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1497500" lon="101.6957400"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1497000" lon="101.6956800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1496300" lon="101.6955700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1495700" lon="101.6954700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1494600" lon="101.6952600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1494000" lon="101.6952700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493600" lon="101.6952700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493500" lon="101.6952700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493400" lon="101.6952600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493200" lon="101.6952400"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493100" lon="101.6952200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493300" lon="101.6951700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1493600" lon="101.6950600"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1494000" lon="101.6949200"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1494500" lon="101.6947000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1494600" lon="101.6946100"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1495100" lon="101.6945700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1495600" lon="101.6945000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1496100" lon="101.6944000"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1494800" lon="101.6943700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1481900" lon="101.6940800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1479900" lon="101.6940400"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1474900" lon="101.6939500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1472300" lon="101.6938800"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1472000" lon="101.6938700"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1473400" lon="101.6933500"><ele>0.0</ele></trkpt>
      <trkpt lat="3.1473600" lon="101.6933100"><ele>0.0</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;
        
        const parsedRoute = parseGPX(gpxContent);
        setGpxRoute(parsedRoute);
        console.log('Parsed GPX Route:', parsedRoute.length, 'points');
      } catch (error) {
        console.error('Error parsing GPX data:', error);
        Alert.alert('GPX Error', 'Failed to load route data');
      }
    };

    loadData();

    // Set up audio player event listeners
    const statusSubscription = player.addListener('playbackStatusUpdate', (status: any) => {
      console.log('Audio status update:', status);
      if (status.isLoaded) {
        // expo-audio uses different property names
        setIsPlaying(status.playing || false);
        setCurrentTime(status.currentTime || 0);
        setDuration(status.duration || 0);
      }
    });

    return () => {
      statusSubscription?.remove();
      try {
        if (player.playing) {
          player.pause();
        }
      } catch (error) {
        console.log('Audio cleanup error (expected on unmount):', error);
      }
    };
  }, []); // This effect runs once on mount

  const loadAudioStops = async () => {
    try {
      // Hardcode the CSV data from the file since dynamic imports don't work well in React Native
      const csvData = `id,title,script_text,lat,lon
1,Chan See Shu Yuen Clan Ancestral Hall,"[warmly] As we begin our walk, I'd like to welcome you into the warm embrace of the Chan See Shu Yuen Clan Ancestral Hall. Clan houses were established by Chinese migrants who shared the same surname. They offered a sanctuary where those who spoke the same dialect could share news and lend support. This beautiful building was erected between 1897 and 1906 by four tin miners and a few businessmen, and it is recognised as one of Kuala Lumpur's oldest and most ornate clan houses. The hall was originally created for people with the surnames Chan, Tan or Chen. Imagine the sense of community the newcomers must have felt when they walked through these gates. The materials and craftsmen were imported from southern China, and the structure is still protected as a heritage building. Today the hall functions as a Buddhist temple and opens its doors to visitors from 9 a.m. to 5 p.m. every day. I hope you'll take a moment to appreciate the intricate carvings and the history of this special meeting place where the story of many Chinese families in Kuala Lumpur began.",3.1402646,101.6983076
2,Chocha Foodstore,"[playfully] At first glance, this building might look like a tired old hotel, but step inside and you'll discover the quirky Chocha Foodstore. This shop is housed in what was once the Mah Lian Hotel, a building dating back to the 1920s that included rooms for a fortune teller, various businesses and even a brothel. The hotel closed long ago, and the structure sat abandoned until architect Shin Chang lovingly restored it. He kept the warren-like layout and the peeling paint to preserve its character and opened Chocha Foodstore in 2016. Today you'll find an unpretentious restaurant on the ground floor serving contemporary farm‑to‑table dishes made with produce grown behind the owner's parents' house. There's a bicycle repair shop beside the dining room, and upstairs the space now houses a bar and a co‑working office for architects. If you can, come back later for dinner – the food here is so good it might give you what I like to call a foodgasm.",3.1408989,101.6980872
3,Ho Kow Hainam Kopitiam,"[smiling] Now we arrive at one of the city's longest‑standing kopitiams, Ho Kow Hainam Kopitiam. Kopitiam literally means coffee shop – kopi is the Malay word for coffee and tiam means shop in Hokkien. These cafés were created by Hainanese‑Chinese cooks who learned to prepare Western‑style breakfasts for British families. After the colonials left, the cooks opened their own establishments, serving buttered toast with coconut jam, soft‑boiled eggs seasoned with soy sauce and pepper, and a range of traditional Hainanese and Malaysian dishes. Ho Kow was founded in 1956 and originally traded from a tiny shophouse along Lorong Panggung. In 2019 the business moved into this swanky nostalgia‑themed building and gave itself a fresh look. It still draws long queues of locals keen to relive childhood memories, so arrive early if you want to try their kaya toast and kopi.",3.1413323,101.6976873
4,"Ali, Muthu & Ah Hock Kopitiam","[cheerfully] This award‑winning kopitiam is special not just for its food, but for the camaraderie behind it. Named after three friends – Ali, Muthu and Ah Hock – who represent Malaysia's Malay, Indian and Chinese communities, the café is a celebration of the country's diversity. The founders kept the rustic décor of the old building to evoke nostalgia. On the menu you'll find Nasi Goreng, Nasi Lemak with fried chicken, Hokkien Mee and a rich chicken rendang. Order a steaming cup of teh tarik, Malaysia's famous 'pulled' tea, to wash down your meal. The staff are happy to explain the dishes, so don't be shy to ask questions.",3.1413989,101.6972928
5,The Attic Bar,"[whispering] Hidden above the Travel Hub guesthouse, The Attic Bar is a secret speakeasy perfect for a sundowner. To reach it you ring the bell and climb a narrow spiral staircase. The interior is cosy, with bare brick walls and an elegant chandelier fashioned from wooden birdcages. Step onto the balcony for a low‑key view of Kuala Lumpur's skyline. The bar serves artisanal cocktails at surprisingly affordable prices, and although it doesn't open until 6 p.m., I suggest making a mental note to return later – your taste buds will thank you.",3.1414019,101.6972366
6,Old Post Office,"This Tudor‑style building once operated as a post office. Built around 1911, the post office stood beside today's Kwai Chai Hong and the Sikh temple, serving the community for decades. It later became a traditional kopitiam called Malaya Hainan Restaurant and, according to local folklore, some people claimed to see a phantom lady [mysterious] on the upper floor. The business has since been taken over and rebranded as Station Kopitiam, but the building's black‑and‑white façade still exudes colonial charm. Feel free to peek inside for a coffee – and maybe keep an eye out for ghosts!",3.1414941,101.6968704
7,Goldsmith Mural,"[thoughtfully] At the end of this row of restored shophouses you'll see a huge mural of an elderly goldsmith at work. Painted in April 2016 by Russian artist Julia Volchkova, it pays homage to the goldsmiths who once plied their trade here. The black‑and‑white artwork depicts the craftsman shaping gold with a hammer, while a modern skyscraper looms in the background. It's the artist's first piece in Kuala Lumpur, and it beautifully contrasts the area's historic trades with the city's rapid development. Take a close look at the tiny painted shophouses beneath the giant building – perhaps you'll spot some familiar landmarks.",3.1416617,101.6971716
8,Yellow Chinese Shophouses,"[cheerfully] These brightly painted yellow and blue shophouses mark the entrance to Kwai Chai Hong. A group of investors bought ten dilapidated buildings here and decided to restore them as a way to celebrate the area's heritage. The project opened to the public in April 2019 and quickly became a hotspot for murals and art installations. When I first visited, the shop lots were empty, but they're gradually filling with new businesses. Take a closer look at the ornate windows and imagine what life might have been like when families lived upstairs and ran their shops below.",3.1416095,101.6976088
9,Kwai Chai Hong,"[enthusiastically] Welcome to Kwai Chai Hong, the lovingly restored heritage lane that brings the stories of Chinatown's 1960s settlers to life. Until 2019 this alley was hidden behind a kopitiam and a row of crumbling shophouses. Today it features six evocative murals showing scenes from daily life: a landlady leaning over her balcony, children playing pranks, musicians, calligraphers and even a coquettish lady of the night. QR codes next to each painting offer more details, though you might need a local to translate. The name Kwai Chai Hong means 'Little Ghost Alley' in Cantonese – some say it refers to mischievous kids who played tricks in the lane, while others insist it recalls the shady vices of gambling, prostitution and gangsterism. Which story do you prefer?",3.1415238,101.6976262
10,'Birds' Street Art,"[lightly] Tucked along the lane is a cheerful mural of two colourful birds. There isn't much published about this artwork, but its bright hues brighten up the alley and make for a fun photo stop. Take a moment to enjoy the playful vibes before we move on.",3.141432,101.6976336
11,Bubble Bee Cafe,"[gently] If you've got a sweet tooth, Bubble Bee Café is the place to treat yourself. It opened in 2017 as part of the revitalisation of Petaling Street and offers waffles, bubble tea and other desserts in a cosy setting. It's one of the few shops with direct access to Kwai Chai Hong. Why not grab a quick snack before we continue?",3.1417363,101.6978576
12,Petaling Street,"[narrating] Petaling Street is the beating heart of Kuala Lumpur's Chinatown. In the 19th century the road led to tin mines, and most residents here were Hakka and Cantonese miners. During the Selangor Civil War many buildings were destroyed, but Kapitan Yap Ah Loy persuaded the miners to stay and rebuild. He opened a tapioca mill on the street, which earned it the nickname 'Chee Cheong Kai' or Starch Factory Street. Over time the area evolved into a bustling market lined with stalls selling food, textiles and souvenirs. In 2003 the street underwent a major facelift; archways and a green roof were added and motor vehicles were banned. Today it remains a lively bazaar – feel free to explore, but watch out for counterfeit goods and be ready to bargain.",3.1426039,101.6978695
13,Sri Maha Mariamman Temple,"[reverently] On your left is the magnificent Sri Maha Mariamman Temple, the oldest Hindu temple in Kuala Lumpur. Founded in 1873 as a private shrine for a prominent Tamil family, it opened to the public in the 1920s and now serves the city's Hindu community. The temple's 23‑metre‑high gopuram (gateway tower) is covered with 228 colourful sculptures of Hindu deities and is an impressive sight. During the annual Thaipusam festival, a silver chariot carrying the statue of the goddess Mariamman departs from here on its pilgrimage to the Batu Caves. Remember to remove your shoes and dress modestly if you wish to enter.",3.143399,101.6964545
14,Guan Di Temple,"[calmly] The Guan Di Temple dates back to 1888 and honours the Chinese general Guan Di, who is revered as the god of war. Legend says he was a great warrior known for his loyalty and integrity. Local devotees believe that touching the temple's 59‑kilogram 'guan dao' spear or its companion sword brings good luck and protection. Built with donations from the Chinese community, the temple remains a popular place of worship and is open daily from 7 a.m. to 7 p.m. If you arrive early, the air will be filled with fragrant incense – a perfect moment for a quiet prayer or reflection.",3.1440178,101.6966904
15,Kasturi Walk,"[cheerfully] Just outside Central Market lies Kasturi Walk, a covered pedestrian walkway lined with stalls selling local snacks, souvenirs and handicrafts. It opened in 2011 as a companion to the market and features buskers and street performers who add to the cheerful atmosphere. If you're thirsty, this is a great spot to buy a fresh coconut or sample some kuih (sweet cakes).",3.1449809,101.6957644
16,Central Market,"[nostalgic] This imposing art‑deco building began life in 1888 as Kuala Lumpur's main wet market. It was expanded several times before the present building was completed in 1937. The market originally sold fresh produce – fish, meat, fruit and vegetables – and it was so lively that British administrator Frank Swettenham once described it as a huge gambling booth filled with noisy crowds. When modern wet markets were built in the suburbs in the 1970s, the council planned to demolish Central Market, but heritage activists saved it. Today it is a heritage centre organised into Malay, Straits Chinese and Little India sections. Inside you'll find batik clothing, handicrafts, artwork and caricature artists. Be sure to explore the annexe at the back for portrait artists and contemporary exhibitions.",3.1452825,101.6954071
17,OCBC Building,"[informative] Across the road stands an elegant art‑deco structure built in 1937 to house the Kuala Lumpur headquarters of the Oversea Chinese Banking Corporation (OCBC). The bank later moved and the building is now known as Urbanscapes House, used as a creative space for exhibitions and events. Notice the streamlined curves and geometric motifs typical of art‑deco architecture.",3.1467295,101.6960376
18,Medan Pasar,"[reflectively] Medan Pasar, or Market Square, marks the site of Kuala Lumpur's earliest settlement. Its most striking feature is the art‑deco clock tower built in 1937 to commemorate the coronation of King George VI. Designed by architect Arthur Oakley Coltman, the 25‑foot tower features a sunburst motif and originally displayed a commemorative plaque that was later removed after independence. This square once housed the bustling central market and the home of Yap Ah Loy, the Chinese Kapitan who rebuilt Kuala Lumpur after the civil war. He replaced wooden buildings with brick structures, built roads like Petaling Street and even established a tapioca mill here to encourage miners to stay. Try to imagine the crowds that once gathered to gamble, trade and gossip.",3.1473909,101.6959732
19,The Birth of KL (view of Masjid Jamek),"[wondering] We've reached the confluence of the Gombak and Klang rivers, the very place where Kuala Lumpur – which translates to 'muddy confluence' – was born. In 1857 a group of 87 Chinese miners sent by Raja Abdullah travelled upriver by boat and landed here because the water was too shallow to continue. They carried weapons, rice, coconut oil and even opium, but only 18 survived the malaria‑infested jungle. After the Selangor Civil War, Kapitan Yap Ah Loy rebuilt the settlement, laid out new roads and set up a tapioca mill to encourage miners to stay. Standing on the riverbank today, you'll see the graceful Masjid Jamek mosque across the water. It's hard to imagine that this muddy confluence has become a modern metropolis in just over 160 years.",3.1482282,101.6959407
20,Masjid Jamek,"[respectfully] Masjid Jamek was built on the site of an old Malay burial ground at the confluence of the rivers. The foundation stone was laid on 23 March 1908, and the mosque officially opened on 23 December 1909. Designed by British architect Arthur Benison Hubback in an Indo‑Saracenic style, it cost $32,625 and was funded by the local Malay community and the British government. For more than half a century it served as Kuala Lumpur's main mosque until the National Mosque opened in 1965. Its domes and minarets echo Moorish architecture, and although one minaret's dome collapsed in 1993 it has been restored. If you'd like to explore inside, robes and headscarves are available at the entrance, and visitors are welcome outside prayer times.",3.1487881,101.6956711
21,Former Survey Office,"[concerned] The elegant building in front of you was constructed between 1909 and 1910 to house the Survey Department of the Federated Malay States. Designed by Arthur Benison Hubback, it features a 400‑foot colonnade and two 80‑foot octagonal towers topped with onion domes. In the 1980s the premises were used by the sessions and magistrates courts, but since then the structure has fallen into disrepair. A spire collapsed after heavy rain in 2016 and weeds now sprout from the roof. Despite its shabby state, the building has been gazetted as a heritage site, and we can only hope it will be restored to its former glory.",3.1500102,101.6956053
22,Old City Hall (Panggung Bandaraya),"[excited] This handsome building, built between 1896 and 1904, originally served as Kuala Lumpur's City Hall and a theatre for plays and concerts. Another creation of Arthur Benison Hubback, it showcases a Moorish facade with domes and arches. In 1992 a major fire gutted the interior, but the city council restored the hall soon after, adding modern seating and sound systems while preserving the exterior. Today it's known as Panggung Bandaraya DBKL, although performances are sporadic. It's worth admiring the facade and imagining the lively dances and operas that once took place here.",3.1503878,101.6950435
23,Former High Court Building,"[factual] Next is the former Supreme Court, constructed from 1912 to 1915 for $208,500 Straits Dollars. Also designed by Arthur Benison Hubback, it features a double arcade of columns and four domed corner towers. As Kuala Lumpur grew, the high court eventually moved to larger premises, and this building now houses the Ministry of Information, Communications and Culture. Like its neighbours, it requires maintenance to prevent further decay.",3.1500075,101.6947599
24,Sultan Abdul Samad Building,"[excited] This is arguably Kuala Lumpur's most photogenic colonial building. Constructed between 1894 and 1897 to house government offices, it was designed by A.C. Norman, with contributions from R.A.J. Bidwell and Arthur Benison Hubback, and is clad in red bricks from the Brickfields area. The style blends Indo‑Saracenic and Moorish elements, and the central clock tower rises 41 metres, echoing London's Big Ben. The building originally held various government departments and later served as the High Court and Supreme Court before being renamed in 1974 after Sultan Abdul Samad. Today it houses the Ministry of Communications and Multimedia and the Ministry of Tourism and Culture. Look closely at the striped brickwork known as the 'blood and bandages' style and imagine the amount of upkeep needed to maintain the ornate clock.",3.1487538,101.6944164
25,Old General Post Office,"[matter-of-fact] Built between 1902 and 1907 at a cost of $100,000 Straits Dollars, this building served as Kuala Lumpur's third General Post Office. The contract had to be completed by contractor Walter Pallister after the original builder failed, and the structure is notable for being the only Mughal‑style building in the city without domes. Postal operations moved elsewhere in 1985, and today the building houses a government office. It was declared a national heritage site in 2007.",3.1477113,101.6942072
26,National Textile Museum,"[inviting] Next door is the National Textile Museum, housed in an Indo‑Saracenic Revival building designed by Arthur Benison Hubback. Completed in 1905, it originally served as the headquarters for the Federated Malay States Railways and later housed agencies like the Selangor Water Department and the Central Bank. After various tenants came and went, the building was refurbished and opened to the public as a textile museum on 9 January 2010. Inside you can learn about batik production, woodblock printing and fabrics made from pineapple fibre. Admission is inexpensive, and the air conditioning offers a welcome break from the heat!",3.1467579,101.6940249
27,Old Chartered Bank Building,"[astonished] This cream‑coloured building was opened in December 1909 as the Kuala Lumpur branch of the Chartered Bank of India, Australia and China, the first bank to be established in the city. Rapid business growth led to the commissioning of this three‑storey Indo‑Saracenic building with horseshoe arches and scalloped windows. In 1926 the Klang and Gombak rivers flooded, submerging the bank's basement vault, and millions of dollars in banknotes had to be laid out on the Padang to dry. Over the years the building served as the National History Museum, a district land office and a music museum. It is currently vacant but has been gazetted as a national heritage building.",3.1470653,101.6935989
28,Old Government Printing Office (City Gallery),"[curiously] On the south side of Merdeka Square stands the Kuala Lumpur City Gallery, housed in the former Government Printing Office. Built in 1899 and designed by British architect A.C. Norman, it produced official government reports, train tickets and other printed materials. The building was later acquired by City Hall and converted into the first public library of Kuala Lumpur in 1986. After refurbishment it reopened as the City Gallery, showcasing a 360‑degree model of Kuala Lumpur, historical photographs and an 'I ❤ KL' sculpture. Pop inside to enjoy the air conditioning and learn about the city's past.",3.1472045,101.6932234
29,Independence Flag – Merdeka Square,"[solemnly] This field, now known as Dataran Merdeka or Independence Square, is where Malaysia's history changed forever. On the night of 30 August 1957, thousands gathered here to witness the birth of a new nation. At 11:58 p.m. the lights were switched off for two minutes of silence; then the Union Jack was lowered and the new Malayan flag was hoisted as the crowd cheered 'Merdeka! Merdeka!'. The lights came back on at midnight, marking the start of independence. The field was originally used for cricket and colonial sports but later became the focal point for parades and celebrations. Every Monday morning at 9:45 a.m. a flag raising ceremony takes place here.",3.1478571,101.6933847
30,Royal Selangor Club,"[playfully] We end our tour at the Royal Selangor Club, founded in 1884 as a meeting place for educated and high‑ranking members of British colonial society. Early members were mostly British officials, although membership was determined more by social standing than race. The club initially occupied a small wooden building but moved into a two‑storey clubhouse designed by A.C. Norman in 1890 and later rebuilt in 1910 by Arthur Benison Hubback in Mock Tudor style. The club earned the nickname 'The Spotted Dog'; some say this referred to its mixed membership, while others claim it was inspired by the two Dalmatians belonging to a founder's wife. Although originally the preserve of European planters and colonial officials, the club's membership gradually diversified and today it hosts Indian lawyers and other professionals. Standing on the terrace, you can almost hear the echoes of cricket matches, rugby games and boisterous parties from days gone by.",3.1487199,101.6928507`;

      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');

      const parsedStops: AudioStop[] = lines.slice(1).map(line => {
        // Handle quoted CSV fields that might contain commas
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // Add the last value

        return {
          id: values[0]?.replace(/"/g, '') || '',
          title: values[1]?.replace(/"/g, '') || '',
          script_text: values[2]?.replace(/"/g, '') || '',
          lat: parseFloat(values[3]?.replace(/"/g, '') || '0'),
          lon: parseFloat(values[4]?.replace(/"/g, '') || '0')
        };
      }).filter(stop => stop.id && !isNaN(stop.lat) && !isNaN(stop.lon));

      console.log('Loaded stops:', parsedStops.length);
      setStops(parsedStops);

      // Set loading to false only after both stops and GPX are processed (or attempted)
      // This will be handled by the useEffect that depends on stops and gpxRoute
    } catch (error) {
      console.error('Error loading audio stops:', error);
      Alert.alert('Error', 'Failed to load audio tour data');
      setLoading(false); // Ensure loading is false even on error
    }
  };

  // Effect to generate map HTML when stops or GPX data is ready
  useEffect(() => {
    if (stops.length > 0 && gpxRoute.length > 0) {
      console.log('Generating map with stops and GPX route...');
      const latitudes = stops.map(s => s.lat);
      const longitudes = stops.map(s => s.lon);
      // Calculate center based on all points (stops + GPX route)
      const allLat = [...latitudes, ...gpxRoute.map(p => p.lat)];
      const allLon = [...longitudes, ...gpxRoute.map(p => p.lon)];

      if (allLat.length === 0 || allLon.length === 0) {
          console.error("No valid coordinates found for map centering.");
          setMapHTML(''); // Clear map HTML if no coordinates
          setLoading(false);
          return;
      }

      const centerLat = (Math.min(...allLat) + Math.max(...allLat)) / 2;
      const centerLng = (Math.min(...allLon) + Math.max(...allLon)) / 2;

      // Call generateAudioTourMapHTML with GPX route data.
      // NOTE: You must update ../utils/mapTileGenerator.ts to accept and use the 'gpxRoute' parameter.
      // For example, its signature might become:
      // generateAudioTourMapHTML(audioStops: AudioStop[], centerLat: number, centerLng: number, gpxRoute?: { lat: number; lon: number }[]): string
      const html = generateAudioTourMapHTML(stops, centerLat, centerLng, gpxRoute, showUserLocation);
      setMapHTML(html);
      setLoading(false); // Set loading to false once map is generated
    } else if (stops.length > 0 && gpxRoute.length === 0) {
      // If GPX failed or is empty, generate map with stops only
      console.log('Generating map with stops only (GPX data missing or empty)...');
      const latitudes = stops.map(s => s.lat);
      const longitudes = stops.map(s => s.lon);

      if (latitudes.length === 0 || longitudes.length === 0) {
          console.error("No valid coordinates found for map centering.");
          setMapHTML('');
          setLoading(false);
          return;
      }

      const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
      const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
      const html = generateAudioTourMapHTML(stops, centerLat, centerLng, undefined, showUserLocation); // No GPX data
      setMapHTML(html);
      setLoading(false);
    } else if (stops.length === 0) {
      // If stops failed to load, but GPX is present, generate map with GPX route only
      if (gpxRoute.length > 0) {
          console.log('Generating map with GPX route only (audio stops missing)...');
          const latitudes = gpxRoute.map(p => p.lat);
          const longitudes = gpxRoute.map(p => p.lon);
          const centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
          const centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
          // Assuming generateAudioTourMapHTML can accept only GPX route if no stops
          // This might require an update to mapTileGenerator
          const html = generateAudioTourMapHTML([], centerLat, centerLng, gpxRoute, showUserLocation);
          setMapHTML(html);
      } else {
          console.log('No stops or GPX data available to generate map.');
          setMapHTML(''); // Clear map if no data
      }
      setLoading(false);
    }
  }, [stops, gpxRoute]); // Re-run when stops or gpxRoute change

  // Update user location on map when location changes
  useEffect(() => {
    if (location && webViewRef.current && showUserLocation) {
      console.log('Sending location update to AudioTourScreen WebView:', location);
      webViewRef.current.postMessage(JSON.stringify({
        action: 'updateUserLocation',
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading || 0
      }));
    }
  }, [location, showUserLocation]);

  

  // Static mapping of audio files for require()
  const audioFiles: { [key: string]: any } = {
    '1': require('../assets/audiotour/1.mp3'),
    '2': require('../assets/audiotour/2.mp3'),
    '3': require('../assets/audiotour/3.mp3'),
    '4': require('../assets/audiotour/4.mp3'),
    '5': require('../assets/audiotour/5.mp3'),
    '6': require('../assets/audiotour/6.mp3'),
    '7': require('../assets/audiotour/7.mp3'),
    '8': require('../assets/audiotour/8.mp3'),
    '9': require('../assets/audiotour/9.mp3'),
    '10': require('../assets/audiotour/10.mp3'),
    '11': require('../assets/audiotour/11.mp3'),
    '12': require('../assets/audiotour/12.mp3'),
    '13': require('../assets/audiotour/13.mp3'),
    '14': require('../assets/audiotour/14.mp3'),
    '15': require('../assets/audiotour/15.mp3'),
    '16': require('../assets/audiotour/16.mp3'),
    '17': require('../assets/audiotour/17.mp3'),
    '18': require('../assets/audiotour/18.mp3'),
    '19': require('../assets/audiotour/19.mp3'),
    '20': require('../assets/audiotour/20.mp3'),
    '21': require('../assets/audiotour/21.mp3'),
    '22': require('../assets/audiotour/22.mp3'),
    '23': require('../assets/audiotour/23.mp3'),
    '24': require('../assets/audiotour/24.mp3'),
    '25': require('../assets/audiotour/25.mp3'),
    '26': require('../assets/audiotour/26.mp3'),
    '27': require('../assets/audiotour/27.mp3'),
    '28': require('../assets/audiotour/28.mp3'),
    '29': require('../assets/audiotour/29.mp3'),
    '30': require('../assets/audiotour/30.mp3'),
  };

  const playAudio = async (stop: AudioStop) => {
    try {
      setCurrentStop(stop);
      setCurrentIndex(parseInt(stop.id) - 1);

      // Update active marker on map
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          action: 'setActiveMarker',
          index: parseInt(stop.id) - 1
        }));
      }

      // Get audio source from static mapping
      const audioUri = audioFiles[stop.id];
      if (!audioUri) {
        Alert.alert('Audio Error', 'Audio file for stop ' + stop.id + ' not found.');
        return;
      }

      console.log('Attempting to play audio for stop:', stop.id);
      console.log('Audio URI:', audioUri);

      // Stop current audio if playing
      try {
        if (player.playing) {
          await player.pause();
        }
      } catch (pauseError) {
        console.log('Pause error (continuing):', pauseError);
      }

      // Load and play new audio
      await player.replace(audioUri as AudioSource);
      await player.play();

      console.log('Audio playback started');
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Audio Error', `Could not play audio for stop ${stop.id}: ${error.message}`);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (!currentStop) {
        console.log('No current stop selected');
        return;
      }
      
      if (isPlaying) {
        await player.pause();
        console.log('Audio paused');
      } else {
        await player.play();
        console.log('Audio resumed');
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Audio Error', 'Unable to control audio playback');
    }
  };

  const navigateToStop = (direction: 'prev' | 'next') => {
    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < stops.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex && stops[newIndex]) {
      const stop = stops[newIndex];
      playAudio(stop);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
          animated={true}
        />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading audio tour...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
        animated={true}
      />
      <View style={{ backgroundColor: theme.colors.primary, flex: 1 }}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Audio Tour</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={toggleLocationTracking}
            >
              <Ionicons 
                name={showUserLocation ? "location" : "location-outline"} 
                size={24} 
                color={showUserLocation ? theme.colors.accent : "white"} 
              />
            </TouchableOpacity>
          </View>

          {/* Map Container */}
          <View style={styles.mapContainer}>
            {mapHTML ? (
              <WebView
                ref={webViewRef}
                source={{ html: mapHTML }}
                style={styles.webview}
                onError={(error) => {
                  console.error('WebView error:', error);
                  Alert.alert('Map Error', 'Failed to load map');
                }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    console.log('WebView message:', data);
                    if (data.type === 'stopClick') {
                      playAudio(data.stop);
                    }
                  } catch (error) {
                    console.error('Error parsing message:', error);
                  }
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webviewLoading}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading map...</Text>
                  </View>
                )}
                onLoadEnd={() => {
                  console.log('Audio tour map loaded, user location enabled:', showUserLocation, 'location:', location);
                  if (showUserLocation && location) {
                    console.log('Sending initial location to audio tour map:', location);
                    setTimeout(() => {
                      webViewRef.current?.postMessage(JSON.stringify({
                        action: 'updateUserLocation',
                        latitude: location.latitude,
                        longitude: location.longitude,
                        heading: location.heading || 0
                      }));
                    }, 1000); // Give WebView time to fully load
                  }
                }}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="headset-outline" size={64} color={theme.colors.muted} />
                <Text style={styles.noDataText}>No audio tour data available</Text>
                <Text style={styles.noDataSubtext}>
                  Found {stops.length} stops
                </Text>
              </View>
            )}
          </View>

          {/* Audio Player */}
          {currentStop && (
            <View style={styles.audioPlayer}>
              <View style={styles.stopInfo}>
                <Text style={styles.stopNumber}>Stop {currentStop.id}</Text>
                <Text style={styles.stopTitle} numberOfLines={2}>
                  {currentStop.title}
                </Text>
              </View>

              <View style={styles.controls}>
                <TouchableOpacity
                  style={[styles.controlButton, currentIndex === 0 && styles.disabledButton]}
                  onPress={() => navigateToStop('prev')}
                  disabled={currentIndex === 0}
                >
                  <Ionicons name="play-skip-back" size={24} color={currentIndex === 0 ? theme.colors.muted : 'white'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, currentIndex === stops.length - 1 && styles.disabledButton]}
                  onPress={() => navigateToStop('next')}
                  disabled={currentIndex === stops.length - 1}
                >
                  <Ionicons name="play-skip-forward" size={24} color={currentIndex === stops.length - 1 ? theme.colors.muted : 'white'} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                    ]}
                  />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 34,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  locationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },
  noDataText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  audioPlayer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 140,
  },
  stopInfo: {
    marginBottom: 16,
  },
  stopNumber: {
    color: 'white',
    fontSize: 14,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
    opacity: 0.8,
  },
  stopTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: theme.fonts.body,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});