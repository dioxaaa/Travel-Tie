const REGION_MAP = {
  asia:'Asia', europe:'Europe', africa:'Africa', oceania:'Oceania',
  'north america':'North America', 'south america':'South America',
  'middle east':'Middle East', 'middle-east':'Middle East',
  americas:'North America', 'central america':'North America',
};

// Local enrichment — coords, curated images, highlights, tips for known IDs
const DEST_DATA = [
  {id:'bali-indonesia',name:'Bali',country:'Indonesia',region:'asia',budget:'budget',rating:4.9,lat:-8.3405,lng:115.0920,basePrice:45,image:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=85',description:'A tropical paradise of lush rice terraces, ancient Hindu temples, and world-class surf breaks. Bali blends spiritual serenity with vibrant culture.',tags:['Beach','Culture','Yoga'],highlights:['Tanah Lot Temple at sunset','Tegallalang Rice Terraces','Sacred Monkey Forest Ubud','Mount Batur sunrise hike'],tips:['Visit temples in early morning to avoid crowds.','Rent a scooter for flexible local travel.','Dress modestly with a sarong at sacred sites.']},
  {id:'tokyo-japan',name:'Tokyo',country:'Japan',region:'asia',budget:'moderate',rating:4.9,lat:35.6762,lng:139.6503,basePrice:90,image:'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=85',description:'Where neon-lit skyscrapers rise beside ancient shrines. Tokyo is a sensory marvel of tradition and cutting-edge innovation, unmatched anywhere on earth.',tags:['Culture','Food','Technology'],highlights:['Shibuya Crossing at night','Senso-ji Temple at dawn','teamLab Planets digital art','Tsukiji outer market'],tips:['Get a Suica card for seamless transit.','Try conveyor-belt sushi for affordable dining.','Book popular restaurants weeks ahead.']},
  {id:'kyoto-japan',name:'Kyoto',country:'Japan',region:'asia',budget:'moderate',rating:4.8,lat:35.0116,lng:135.7681,basePrice:80,image:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=85',description:"Japan's ancient imperial capital — over 1,600 Buddhist temples, gilded pavilions, and misty bamboo groves that transport you centuries into the past.",tags:['History','Temples','Culture'],highlights:['Fushimi Inari torii gates','Arashiyama bamboo grove','Kinkaku-ji Golden Pavilion','Geisha district Gion'],tips:['Visit bamboo grove at 6 AM before tour groups.','Rent a bicycle to explore the old city.','Try matcha kaiseki cuisine.']},
  {id:'bangkok-thailand',name:'Bangkok',country:'Thailand',region:'asia',budget:'budget',rating:4.7,lat:13.7563,lng:100.5018,basePrice:35,image:'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=700&q=85',description:"Thailand's electric capital is a feast for every sense — golden temples, endless floating markets, legendary street food, and pulsating nightlife.",tags:['Food','Temples','Nightlife'],highlights:['Grand Palace complex','Wat Pho reclining Buddha','Floating markets at dawn','Chao Phraya river cruise'],tips:['Use BTS Skytrain to escape traffic.','Dress modestly at all temples.','Bargain politely in markets — start at 40%.']},
  {id:'singapore-city',name:'Singapore',country:'Singapore',region:'asia',budget:'luxury',rating:4.8,lat:1.3521,lng:103.8198,basePrice:150,image:'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=700&q=85',description:"A gleaming island city-state where futuristic supertrees glow above the skyline, and the world's finest hawker stalls sit beside Michelin-starred restaurants.",tags:['Modern','Food','Architecture'],highlights:['Gardens by the Bay supertree grove','Marina Bay Sands infinity pool','Maxwell hawker centre','Jewel Changi waterfall'],tips:['Eat at hawker centres for incredible food at low cost.','EZ-Link card covers all public transit.','Book Marina Bay Sands skypark at sunset.']},
  {id:'paris-france',name:'Paris',country:'France',region:'europe',budget:'moderate',rating:4.7,lat:48.8566,lng:2.3522,basePrice:110,image:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=85',description:'The City of Light never loses its magic — the Eiffel Tower glittering at midnight, cobblestone streets of Montmartre, world-class art, and perfect croissants.',tags:['Romance','Art','Food'],highlights:['Eiffel Tower at night','Louvre Museum','Montmartre & Sacré-Coeur','Seine river cruise'],tips:['Book Eiffel Tower tickets online weeks ahead.','The Paris Museum Pass saves significant money.','Walk the Left Bank for authentic Parisian feel.']},
  {id:'rome-italy',name:'Rome',country:'Italy',region:'europe',budget:'moderate',rating:4.8,lat:41.9028,lng:12.4964,basePrice:95,image:'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=700&q=85',description:'The Eternal City — 2,800 years of history layered across ancient ruins, Renaissance basilicas, and lively piazzas where the best gelato awaits around every corner.',tags:['History','Art','Food'],highlights:['Colosseum & Roman Forum','Vatican Museums & Sistine Chapel','Trevi Fountain','Trastevere neighbourhood'],tips:['Book Vatican entry at least 2 weeks ahead.','Eat lunch at tavola calda spots, not tourist squares.','Wear comfortable shoes for cobblestones.']},
  {id:'barcelona-spain',name:'Barcelona',country:'Spain',region:'europe',budget:'moderate',rating:4.8,lat:41.3851,lng:2.1734,basePrice:100,image:'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=700&q=85',description:"Gaudí's fantastical architecture, golden Mediterranean beaches, world-class football, and a food scene that stretches from Michelin-starred restaurants to perfect tapas bars.",tags:['Architecture','Beach','Food'],highlights:['Sagrada Família interior','Park Güell mosaic terrace','La Boqueria market','Gothic Quarter narrow lanes'],tips:['Book Sagrada Família months ahead online.','Order menú del día for great value lunch.','Beaches are best in May-June and September.']},
  {id:'santorini-greece',name:'Santorini',country:'Greece',region:'europe',budget:'luxury',rating:4.9,lat:36.3932,lng:25.4615,basePrice:150,image:'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=85',description:"Iconic whitewashed villages cling to volcanic cliffs above the caldera. Oia's legendary sunset, volcanic beaches, and exceptional wines make this the ultimate romantic escape.",tags:['Romance','Views','Wine'],highlights:['Oia village sunset','Caldera cliff walk','Black & Red volcanic beaches','Santo Wines tasting'],tips:['Book accommodation in Oia 6+ months ahead.','Rent an ATV to explore the island freely.','Visit May or October for calmer weather and lower prices.']},
  {id:'amsterdam-netherlands',name:'Amsterdam',country:'Netherlands',region:'europe',budget:'moderate',rating:4.6,lat:52.3676,lng:4.9041,basePrice:105,image:'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=700&q=85',description:'A city of 165 canals, gabled 17th-century houses, world-class museums, and a famously relaxed spirit. Explore by bicycle and discover endless surprises.',tags:['Culture','History','Cycling'],highlights:['Rijksmuseum masterworks','Anne Frank House','Canal ring boat tour','Jordaan neighbourhood'],tips:["Rent a bike — it's the authentic Amsterdam experience.",'Book Anne Frank House weeks in advance online.','Iamsterdam card covers transit and major museums.']},
  {id:'new-york-usa',name:'New York City',country:'USA',region:'north america',budget:'luxury',rating:4.8,lat:40.7128,lng:-74.0060,basePrice:170,image:'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=700&q=85',description:'The city that never sleeps — a relentless, exhilarating global capital of art, culture, cuisine, and ambition, with a skyline that stops you in your tracks every single time.',tags:['Urban','Culture','Food'],highlights:['Manhattan skyline from Brooklyn Bridge','Central Park in fall','Metropolitan Museum of Art','Times Square at night'],tips:['Get a MetroCard — the subway is the fastest way anywhere.','Buy Broadway tickets day-of via TKTS for discounts.','Free: Central Park, High Line, Staten Island Ferry views.']},
  {id:'mexico-city-mexico',name:'Mexico City',country:'Mexico',region:'north america',budget:'budget',rating:4.7,lat:19.4326,lng:-99.1332,basePrice:45,image:'https://images.unsplash.com/photo-1518659526054-190340b32735?w=700&q=85',description:"One of the world's great megacities — extraordinary pre-Columbian ruins, Diego Rivera murals, world-ranked restaurants, and a street food culture that is simply unrivalled.",tags:['Culture','Food','History'],highlights:['Teotihuacán pyramids','Frida Kahlo Museum','Zócalo & Metropolitan Cathedral','Xochimilco floating gardens'],tips:['Metro is incredibly cheap and covers the city.','Try street tacos at busy stalls — the best.','Altitude (2,240m) may affect you — hydrate well.']},
  {id:'vancouver-canada',name:'Vancouver',country:'Canada',region:'north america',budget:'moderate',rating:4.7,lat:49.2827,lng:-123.1207,basePrice:120,image:'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=700&q=85',description:"Snow-capped mountains meet the Pacific Ocean in one of the world's most beautiful cities. Outdoor adventure, diverse food, and stunning scenery await year-round.",tags:['Nature','Outdoor','Food'],highlights:['Stanley Park seawall walk','Capilano Suspension Bridge','Granville Island market','Whistler day trip'],tips:['Compass Card covers all transit including SeaBus.','Stanley Park is completely free and breathtaking.','Visit Granville Island for fresh local produce.']},
  {id:'havana-cuba',name:'Havana',country:'Cuba',region:'north america',budget:'budget',rating:4.5,lat:23.1136,lng:-82.3666,basePrice:40,image:'https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=700&q=85',description:'A city frozen in glorious colour — crumbling baroque architecture, vintage American cars, salsa rhythms spilling from doorways, and a resilient, joyful spirit unlike anywhere else.',tags:['Culture','History','Music'],highlights:['Old Havana UNESCO streets','Classic car tour of Malecón','Fábrica de Arte Cubano','Trinidad colonial town'],tips:['Bring cash — US cards may not work.','Stay in a casa particular for authentic experience.','Learn basic Spanish phrases — locals deeply appreciate it.']},
  {id:'cancun-mexico',name:'Cancún',country:'Mexico',region:'north america',budget:'budget',rating:4.5,lat:21.1619,lng:-86.8515,basePrice:55,image:'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=700&q=85',description:'Caribbean turquoise waters, powdery white sand, and nearby ancient Mayan wonders. Cancún offers the perfect blend of relaxation and cultural adventure.',tags:['Beach','History','Nightlife'],highlights:['Chichen Itza at sunrise','Cenote swimming & snorkelling','Isla Mujeres','Tulum cliff-top ruins'],tips:['Visit Chichen Itza at opening to beat heat and crowds.','Rent a car to explore the full Yucatán coast.','All-inclusive resorts offer excellent value.']},
  {id:'rio-de-janeiro-brazil',name:'Rio de Janeiro',country:'Brazil',region:'south america',budget:'moderate',rating:4.7,lat:-22.9068,lng:-43.1729,basePrice:70,image:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=700&q=85',description:'Flanked by jungle mountains and white beaches, Rio pulses with samba, Carnival fever, and the most dramatic urban landscape on earth — Cristo Redentor watches over it all.',tags:['Beach','Culture','Nature'],highlights:['Christ the Redeemer at dawn','Sugarloaf Mountain cable car','Ipanema & Copacabana beaches','Lapa nightlife arches'],tips:['Book Corcovado train tickets online in advance.','Stay in Ipanema or Leblon for safety.','Take a guided community tour to understand local life.']},
  {id:'machu-picchu-peru',name:'Machu Picchu',country:'Peru',region:'south america',budget:'moderate',rating:5.0,lat:-13.1631,lng:-72.5450,basePrice:60,image:'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=700&q=85',description:"The legendary lost city of the Inca perches 2,430m above sea level in misty Andean cloud forest. One of humanity's greatest architectural achievements.",tags:['History','Hiking','UNESCO'],highlights:['Sun Gate sunrise views','Huayna Picchu mountain hike','Intihuatana sacred stone','Inca Trail multi-day trek'],tips:['Book entrance tickets months ahead — slots are very limited.','Spend 2 nights in Cusco first to acclimatize.','Take the 5:30 AM bus to witness the sunrise.']},
  {id:'buenos-aires-argentina',name:'Buenos Aires',country:'Argentina',region:'south america',budget:'budget',rating:4.6,lat:-34.6037,lng:-58.3816,basePrice:50,image:'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=700&q=85',description:'The Paris of South America — grand European boulevards, world-class steakhouses, passionate tango in candlelit milongas, and a creative energy that is utterly infectious.',tags:['Culture','Food','Nightlife'],highlights:['La Boca colourful Caminito','San Telmo antique market','Authentic tango show & lesson','Recoleta Cemetery mausoleums'],tips:['Dinner starts at 10PM here — embrace it.','Parrillas (steakhouses) offer unmissable Argentinian beef.','Use official taxis or Uber for safe travel.']},
  {id:'cartagena-colombia',name:'Cartagena',country:'Colombia',region:'south america',budget:'budget',rating:4.6,lat:10.3910,lng:-75.4794,basePrice:50,image:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85',description:'A jewel of the Caribbean coast — a perfectly preserved walled colonial city of bougainvillea-draped balconies, golden beaches, and Caribbean warmth.',tags:['History','Beach','Culture'],highlights:['Walled Old City UNESCO streets','Rosario Islands snorkelling','Castillo San Felipe fortress','Sunset from city walls'],tips:['Walk the old city walls at dusk for the best views.','Take a boat to Rosario Islands for crystal Caribbean waters.','Bargain at markets but do so respectfully.']},
  {id:'galapagos-ecuador',name:'Galápagos Islands',country:'Ecuador',region:'south america',budget:'luxury',rating:5.0,lat:-0.9538,lng:-90.9656,basePrice:300,image:'https://images.unsplash.com/photo-1548534863-c0e6a8e1fd3e?w=700&q=85',description:"Darwin's living laboratory — where giant tortoises roam freely, marine iguanas bask on lava rocks, and sea lions play with snorkellers in crystal-clear water.",tags:['Wildlife','Diving','Nature'],highlights:['Snorkelling with sea lions','Giant tortoise sanctuary','Blue-footed booby colonies','Lava tube exploration'],tips:['Book a licensed tour operator months in advance.','Bring reef-safe sunscreen — strong sun and conservation rules.','Go slow — wildlife here has no fear of humans.']},
  {id:'cape-town-south-africa',name:'Cape Town',country:'South Africa',region:'africa',budget:'moderate',rating:4.8,lat:-33.9249,lng:18.4241,basePrice:75,image:'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=700&q=85',description:"Beneath the flat-topped majesty of Table Mountain, Cape Town offers white beaches, extraordinary wine, penguin colonies, and one of the world's most breathtaking drives.",tags:['Nature','Wine','Beach'],highlights:['Table Mountain cable car','Cape Peninsula scenic drive','Boulders Beach penguin colony','Stellenbosch winelands'],tips:['Book Table Mountain cable car early — clouds roll in quickly.','Rent a car for the Cape Peninsula — public transport is limited.','Visit the winelands on a day tour from the city.']},
  {id:'marrakech-morocco',name:'Marrakech',country:'Morocco',region:'africa',budget:'budget',rating:4.6,lat:31.6295,lng:-7.9811,basePrice:40,image:'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=700&q=85',description:"A sensory explosion of colour, sound, and scent — the medieval Medina's labyrinthine souks, ornate palaces, and the legendary Djemaa el-Fna square at dusk.",tags:['Culture','Markets','History'],highlights:['Djemaa el-Fna at sunset','Medina souk maze','Majorelle Garden & Yves Saint Laurent Museum','Bahia Palace'],tips:['Hire a licensed guide for navigating the medina.','Start bargaining at 30-40% of first asking price.','Visit souks in the morning when they\'re less chaotic.']},
  {id:'serengeti-tanzania',name:'Serengeti',country:'Tanzania',region:'africa',budget:'luxury',rating:5.0,lat:-2.1540,lng:34.6857,basePrice:400,image:'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=700&q=85',description:'The greatest wildlife spectacle on earth — millions of wildebeest migrating across golden savannah, lion prides hunting at dawn, and elephant families gathering at waterholes.',tags:['Wildlife','Safari','Nature'],highlights:['Great Migration river crossing','Big Five game drives','Hot air balloon safari','Ngorongoro Crater floor'],tips:['Visit July-October for the Great Migration river crossings.','Book a reputable licensed safari operator well in advance.','Pack neutral-coloured, lightweight clothing.']},
  {id:'zanzibar-tanzania',name:'Zanzibar',country:'Tanzania',region:'africa',budget:'moderate',rating:4.7,lat:-6.1659,lng:39.2026,basePrice:80,image:'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=700&q=85',description:'Spice Island perfection — turquoise Indian Ocean waters, pristine white sand, a UNESCO World Heritage Stone Town of Arab, Persian, and colonial architecture.',tags:['Beach','Culture','Diving'],highlights:['Nungwi & Kendwa white beaches','Stone Town UNESCO old quarter','Spice tour & cooking class','Diving in coral gardens'],tips:['Dress modestly in Stone Town out of respect.','Visit Nungwi for the clearest swimming water.','Hire a local guide for the spice plantation tour.']},
  {id:'cairo-egypt',name:'Cairo',country:'Egypt',region:'africa',budget:'budget',rating:4.5,lat:30.0444,lng:31.2357,basePrice:35,image:'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=700&q=85',description:"One of history's greatest cities — the Great Pyramids of Giza rise from the desert, the Egyptian Museum overwhelms, and the Khan el-Khalili bazaar dazzles at every turn.",tags:['History','Culture','Ancient'],highlights:['Great Pyramid of Giza & Sphinx','Egyptian Museum Tutankhamun treasure','Khan el-Khalili bazaar','Nile sunset felucca sail'],tips:['Visit Giza at sunrise to beat the crowds and heat.','Negotiate taxi fares before getting in.','Dress conservatively — Egypt is a conservative country.']},
  {id:'sydney-australia',name:'Sydney',country:'Australia',region:'oceania',budget:'luxury',rating:4.8,lat:-33.8688,lng:151.2093,basePrice:145,image:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=85',description:"Australia's sparkling harbour city — the iconic Opera House sails, Harbour Bridge climbs, Bondi Beach surf culture, and a dining scene that rivals anywhere in the world.",tags:['Beach','Culture','Outdoor'],highlights:['Sydney Opera House tour','Bondi to Coogee coastal walk','Harbour Bridge climb','Blue Mountains day trip'],tips:['Opal card covers all public transit seamlessly.','Bondi to Coogee walk is free and absolutely stunning.','Book Harbour Bridge Climb at sunrise for best photos.']},
  {id:'queenstown-new-zealand',name:'Queenstown',country:'New Zealand',region:'oceania',budget:'moderate',rating:4.9,lat:-45.0312,lng:168.6626,basePrice:110,image:'https://images.unsplash.com/photo-1469521669194-babb45599def?w=700&q=85',description:'The adventure capital of the world, set in a dramatic landscape of jagged peaks and glacial lakes. Bungee jump, ski, skydive, or simply marvel at the scenery.',tags:['Adventure','Nature','Skiing'],highlights:['Original AJ Hackett bungee jump','Milford Sound fjord cruise','Gondola ride & luge','Skiing at The Remarkables'],tips:['Book all adventure activities at least a week ahead.','Rent a campervan to explore South Island at leisure.','Milford Sound is a must-do — book the day cruise.']},
  {id:'bora-bora-polynesia',name:'Bora Bora',country:'French Polynesia',region:'oceania',budget:'luxury',rating:5.0,lat:-16.5004,lng:-151.7415,basePrice:450,image:'https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?w=700&q=85',description:'The ultimate tropical paradise — a turquoise lagoon of impossible beauty encircling a dramatic volcanic peak, with overwater bungalows floating above coral gardens.',tags:['Beach','Luxury','Diving'],highlights:['Overwater bungalow experience','Coral garden snorkelling','Mount Otemanu viewpoint','Shark & ray feeding lagoon tour'],tips:['Book overwater bungalows many months in advance.','Visit Apr-Nov for calmest weather and clearest water.','Pack reef-safe sunscreen for the coral ecosystem.']},
  {id:'great-barrier-reef-australia',name:'Great Barrier Reef',country:'Australia',region:'oceania',budget:'moderate',rating:4.9,lat:-18.2871,lng:147.6992,basePrice:120,image:'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=700&q=85',description:"The world's largest coral reef system — 2,300km of living underwater wonder visible from space, teeming with sea turtles, reef sharks, and 1,500 species of fish.",tags:['Diving','Nature','Wildlife'],highlights:['Scuba diving coral gardens','Snorkelling with sea turtles','Whitehaven Beach','Heart Reef aerial view'],tips:['Stay in Cairns or Airlie Beach as your base.','Book a full-day liveaboard for the best reef access.','Avoid reef-damaging sunscreen — marine park rules apply.']},
  {id:'fiji-islands',name:'Fiji',country:'Fiji',region:'oceania',budget:'moderate',rating:4.7,lat:-17.7134,lng:178.0650,basePrice:90,image:'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=700&q=85',description:'333 islands of Melanesian warmth, crystal lagoons, and jungle-clad interiors. Fiji is famous for its world-class soft coral diving and the genuine happiness of its people.',tags:['Beach','Culture','Diving'],highlights:['Yasawa Islands island hopping','Beqa Lagoon soft coral diving','Kava ceremony with local village','Sawa-i-Lau limestone caves'],tips:['Island hop by seaplane or the Yasawa Flyer ferry.','Bring a small gift when visiting a traditional village.','Yasawa Islands offer the most pristine beaches.']},
  {id:'dubai-uae',name:'Dubai',country:'UAE',region:'middle east',budget:'luxury',rating:4.7,lat:25.2048,lng:55.2708,basePrice:200,image:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=85',description:"A city of superlatives — the world's tallest tower, indoor ski slopes in the desert, and an audacious vision that has turned a fishing village into a global marvel in 50 years.",tags:['Luxury','Modern','Shopping'],highlights:['Burj Khalifa top floor at sunset','Dubai Mall & indoor ski slope','Al Fahidi Historic District','Desert safari & dune dinner'],tips:['Dubai Metro is air-conditioned, cheap, and extensive.','Book Burj Khalifa sunset slot weeks ahead.','Dress modestly in public areas and malls.']},
  {id:'abu-dhabi-uae',name:'Abu Dhabi',country:'UAE',region:'middle east',budget:'luxury',rating:4.8,lat:24.4539,lng:54.3773,basePrice:180,image:'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=700&q=85',description:"The elegant capital of the UAE — a sophisticated blend of modern architecture, pristine beaches, world-class museums, and the legendary Sheikh Zayed Grand Mosque. Abu Dhabi offers a more refined and cultural experience than its flashy neighbour Dubai.",tags:['Culture','Luxury','Architecture'],highlights:['Sheikh Zayed Grand Mosque','Louvre Abu Dhabi art museum','Corniche waterfront promenade','Emirates Palace luxury hotel'],tips:['Visit the Grand Mosque in the late afternoon for golden hour photos.','The Louvre Abu Dhabi is a must for art and architecture lovers.','Rent a car to explore the island and nearby attractions.']},
  {id:'istanbul-turkey',name:'Istanbul',country:'Turkey',region:'middle east',budget:'moderate',rating:4.8,lat:41.0082,lng:28.9784,basePrice:60,image:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=700&q=85',description:'A city astride two continents where East meets West in the most spectacular way — Byzantine domes, Ottoman minarets, vibrant bazaars, and the shimmering Bosphorus.',tags:['History','Culture','Food'],highlights:['Hagia Sophia interior','Grand Bazaar carpet shopping','Blue Mosque at prayer time','Bosphorus sunset cruise'],tips:['Istanbulkart makes transit very affordable.','Try simit and börek from street vendors.','Cross to the Asian side by ferry for local atmosphere.']},
  {id:'petra-jordan',name:'Petra',country:'Jordan',region:'middle east',budget:'moderate',rating:5.0,lat:30.3285,lng:35.4444,basePrice:70,image:'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?w=700&q=85',description:"The Rose City — a Nabataean marvel where rose-red temples and tombs were carved directly into sheer sandstone cliffs 2,000 years ago. One of the world's true wonders.",tags:['History','Hiking','UNESCO'],highlights:['The Treasury (Al-Khazneh) at dawn','Siq narrow canyon walk','Monastery (Ad Deir) hike','Petra by Night candlelit walk'],tips:['Arrive at opening (6AM) for Treasury photos without crowds.','Buy the Jordan Pass — covers visa and entry.','Wear closed shoes — the terrain is rocky.']},
  {id:'muscat-oman',name:'Muscat',country:'Oman',region:'middle east',budget:'moderate',rating:4.6,lat:23.5880,lng:58.3829,basePrice:75,image:'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=700&q=85',description:"Oman's graceful capital offers a window into authentic Arabia — magnificent mosques, a colourful old souk, fjord-like Musandam, and the warmest hospitality imaginable.",tags:['Culture','History','Nature'],highlights:['Sultan Qaboos Grand Mosque','Muttrah Souk by night','Wadi Shab gorge & pool','Wahiba Sands desert camp'],tips:['Oman is one of the safest countries in the Middle East.','Dress modestly as a sign of respect.','Rent a 4WD to explore wadis and desert properly.']},
  {id:'jerusalem-israel',name:'Jerusalem',country:'Israel',region:'middle east',budget:'moderate',rating:4.8,lat:31.7683,lng:35.2137,basePrice:85,image:'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=700&q=85',description:'The most sacred city on earth to three great faiths — the golden Dome of the Rock, the Western Wall, the Church of the Holy Sepulchre, and 3,000 years of human history.',tags:['History','Religion','Culture'],highlights:['Western Wall & Jewish Quarter','Dome of the Rock & Al-Aqsa','Church of the Holy Sepulchre','Via Dolorosa ancient route'],tips:['Dress modestly for all religious sites.','The Old City is best explored on foot over 2 days.','Visit Mahane Yehuda market on Friday for peak atmosphere.']},
];

// ── Helpers ───────────────────────────────────────────────────
function getContinent(r) {
  // Handle hyphenated regions from Firestore e.g. "middle-east"
  const key = (r || '').toLowerCase().trim().replace(/-/g, ' ');
  return REGION_MAP[key] || REGION_MAP[(r || '').toLowerCase().trim()] || r || 'Other';
}

function deriveBudget(p) {
  if (!p || isNaN(p)) return 'moderate';
  if (p < 80)  return 'budget';
  if (p < 180) return 'moderate';
  return 'luxury';
}

/**
 * Parse a field stored as array OR comma/newline string.
 * Also capitalises first letter of each tag.
 */
function parseList(val, capitalise = false) {
  if (!val) return null;
  let arr = [];
  if (Array.isArray(val)) {
    arr = val.map(s => String(s).trim()).filter(Boolean);
  } else if (typeof val === 'string') {
    const byLine = val.split('\n').map(s => s.trim()).filter(Boolean);
    arr = byLine.length > 1
      ? byLine
      : val.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (capitalise) arr = arr.map(s => s.charAt(0).toUpperCase() + s.slice(1));
  return arr.length ? arr : null;
}

/**
 * Normalise budget — handles "Moderate", "moderate", "MODERATE"
 */
function parseBudget(val, price) {
  if (!val) return deriveBudget(price);
  const l = String(val).toLowerCase().trim();
  if (l === 'budget' || l === 'moderate' || l === 'luxury') return l;
  return deriveBudget(price);
}

// ── Normalise Firestore doc ───────────────────────────────────
function normalise(docId, fsData) {
  const local = DEST_DATA.find(d => d.id === docId) || {};

  const name    = fsData.place       || local.name    || docId;
  const _rawCountry = fsData.country || local.country || '';
  const BAD_COUNTRY = /^(unknown|unidentified|undefined|n\/a|none|null|-)$/i;
  const country = BAD_COUNTRY.test((_rawCountry || '').trim()) ? '' : (_rawCountry || '').trim();
  const region  = fsData.region      || local.region  || '';
  const desc    = fsData.description || local.description
                  || 'A wonderful destination waiting to be explored.';
  const bp      = Number(fsData.basePrice) || local.basePrice || 80;

  // Image: use Firestore imageUrl only if it's not a known generic fallback URL.
  // This prevents duplicate placeholder images appearing across multiple destination cards.
  const GENERIC_FALLBACKS = ['photo-1488646953014-85cb44e25828','photo-1507525428034-b723cf961d3e','photo-1476514525535-07fb3b4ae5f1'];
  const fsImg = (fsData.imageUrl && String(fsData.imageUrl).trim()) ? String(fsData.imageUrl).trim() : '';
  const isGeneric = !fsImg || GENERIC_FALLBACKS.some(f => fsImg.includes(f));
  const image = (!isGeneric ? fsImg : null) || local.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=85';

  const budget = parseBudget(fsData.budget || local.budget, bp);
  const rating = Number(fsData.rating) || local.rating || 4.5;

  // Tags — capitalise each tag from Firestore strings
  const tags = parseList(fsData.tags, true) || local.tags || ['Travel', 'Explore'];

  // Highlights & tips
  const highlights = parseList(fsData.highlights) || local.highlights
    || ['Iconic landmarks', 'Local cuisine', 'Cultural experiences', 'Scenic views'];
  const tips = parseList(fsData.tips) || local.tips
    || ['Research visa requirements before travelling.', 'Book accommodation in advance.', 'Learn a few local phrases.'];

  return {
    id: docId, name, country,
    continent: getContinent(region),
    description: desc, image, budget, rating,
    lat: Number(fsData.lat) || local.lat || null,
    lng: Number(fsData.lng) || local.lng || null,
    tags, highlights, tips,
    costs: {
      daily:  bp,
      hotel:  Number(fsData.hotelPrice)  || Math.round(bp * 1.6),
      flight: Number(fsData.flightPrice) || local.costs?.flight || 700,
    },
  };
}

// ── Global cache ──────────────────────────────────────────────
window.DESTINATIONS = [];
let _loaded = false, _loadError = false;

window.loadDestinations = async function(forceReload = false) {
  if (_loaded && !forceReload) return window.DESTINATIONS;
  _loaded = false; _loadError = false;

  try {
    const { getDocs, collection } = await import(
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
    );
    const snap = await getDocs(collection(TT.db, 'destinations'));

    if (!snap.empty) {
      window.DESTINATIONS = snap.docs.map(doc => normalise(doc.id, doc.data()));
      window.DESTINATIONS.sort((a, b) => a.name.localeCompare(b.name));
      console.log(`[TravelTie] ✓ Loaded ${window.DESTINATIONS.length} destinations from Firestore`);
    } else {
      console.warn('[TravelTie] destinations collection is empty — using local fallback');
      window.DESTINATIONS = DEST_DATA.map(d => normalise(d.id, {}));
      window.DESTINATIONS.sort((a, b) => a.name.localeCompare(b.name));
      _loadError = true;
    }
  } catch(err) {
    console.error('[TravelTie] Firestore error:', err.message);
    window.DESTINATIONS = DEST_DATA.map(d => normalise(d.id, {}));
    window.DESTINATIONS.sort((a, b) => a.name.localeCompare(b.name));
    _loadError = true;
  }

  _loaded = true;
  // Update hero destination count anywhere on page
  const heroCount = document.getElementById('heroDestCount');
  if (heroCount) heroCount.textContent = window.DESTINATIONS.length + '+';

  return window.DESTINATIONS;
};

// ── Skeleton loader ───────────────────────────────────────────
window.showGridSkeleton = function(gridId, count = 6) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = Array(count).fill(0).map(() => `
    <div style="border-radius:20px;overflow:hidden;background:var(--white);border:1px solid var(--gray-100);box-shadow:var(--sh)">
      <div style="height:215px;background:linear-gradient(90deg,var(--gray-100) 25%,#e8edf2 50%,var(--gray-100) 75%);background-size:400% 100%;animation:shimmer 1.4s infinite"></div>
      <div style="padding:20px 22px">
        <div style="height:18px;background:var(--gray-100);border-radius:6px;margin-bottom:10px;width:70%;animation:ttPulse 1.5s ease-in-out infinite"></div>
        <div style="height:12px;background:var(--gray-100);border-radius:6px;width:45%;animation:ttPulse 1.5s ease-in-out infinite .2s"></div>
      </div>
    </div>`).join('');
};

// ══════════════════════════════════════════════════════════════
// DESTINATIONS PAGE LOGIC
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('destinationsGrid')) return;
  TT.initNav();

  // Check for saved=1 param (returned from login after saving)
  if (new URLSearchParams(window.location.search).get('saved') === '1') {
    const url = new URL(window.location);
    url.searchParams.delete('saved');
    window.history.replaceState({}, '', url);
    setTimeout(() => {
      showToast('Destination saved! <i class="fas fa-heart"></i>', 'success');
    }, 500);
  }
  
  // Check for info=1 param (returned when item was already saved)
  if (new URLSearchParams(window.location.search).get('info') === '1') {
    const url = new URL(window.location);
    url.searchParams.delete('info');
    window.history.replaceState({}, '', url);
    setTimeout(() => {
      showToast('This destination was already saved <i class="fas fa-info-circle"></i>', 'info');
    }, 500);
  }

  let filtered = [], currentPage = 1, savedMap = {};
  const PER_PAGE = 9;

  showGridSkeleton('destinationsGrid', 9);
  const countEl = document.getElementById('destCount');
  if (countEl) countEl.textContent = 'Loading…';

  await loadDestinations();
  if (countEl) countEl.title = _loadError ? '📦 Local fallback' : '🔥 Live from Firestore';

  // Live saved-destinations sync for heart icons & saved panel
  TT.listenSaved(saved => {
    savedMap = {};
    saved.forEach(s => { savedMap[s.id] = s.docId; });
    renderGrid();
    // Update saved panel
    renderSavedPanel(saved);
  });

  // Auth state for saved panel visibility
  TT.onAuthChanged(user => {
    const panel = document.getElementById('savedPanel');
    const overlay = document.getElementById('savedPanelOverlay');
    if (!user) {
      // Hide saved panel if not logged in
      if (panel) panel.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
    }
    // If logged in, let CSS handle the display via .open class
  });

  // Pre-fill from URL params
  const P = new URLSearchParams(window.location.search);
  if (P.get('q'))         { const el = document.getElementById('searchInput');  if (el) el.value = P.get('q'); }
  if (P.get('budget'))    { const el = document.getElementById('budgetFilter'); if (el) el.value = P.get('budget'); }
  if (P.get('continent')) {
    const tab = document.querySelector(`.continent-tab[data-continent="${P.get('continent')}"]`);
    if (tab) { document.querySelectorAll('.continent-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); }
  }
  applyFilters();
  if (P.get('open')) {
    const d = DESTINATIONS.find(x => x.id === P.get('open'));
    if (d) setTimeout(() => openModal(d), 400);
  }

  // Events
  document.querySelectorAll('.continent-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.continent-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPage = 1; applyFilters();
    });
  });
  document.getElementById('applyFilters')?.addEventListener('click', () => { currentPage = 1; applyFilters(); });
  document.getElementById('resetFilters')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('budgetFilter').value = '';
    document.querySelectorAll('.continent-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.continent-tab[data-continent="all"]')?.classList.add('active');
    currentPage = 1; applyFilters();
  });
  document.getElementById('searchInput')?.addEventListener('input', () => { currentPage = 1; applyFilters(); });
  document.getElementById('searchInput')?.addEventListener('keypress', e => { if (e.key === 'Enter') { currentPage = 1; applyFilters(); } });
  document.querySelector('.prev-btn')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderGrid(); } });
  document.querySelector('.next-btn')?.addEventListener('click', () => { if (currentPage < totalPages()) { currentPage++; renderGrid(); } });
  document.getElementById('nlBtn')?.addEventListener('click', () => {
    const e = document.getElementById('nlEmail')?.value.trim();
    if (e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { showToast('Subscribed! <i class="fas fa-check"></i>', 'success'); document.getElementById('nlEmail').value = ''; }
    else showToast('Enter a valid email.', 'error');
  });

  function applyFilters() {
    const q   = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const bud = document.getElementById('budgetFilter')?.value || '';
    const con = document.querySelector('.continent-tab.active')?.dataset.continent || 'all';
    filtered = DESTINATIONS.filter(d => {
      const mQ = !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) ||
        d.continent.toLowerCase().includes(q) || (d.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (d.description || '').toLowerCase().includes(q);
      const mB = !bud || d.budget === bud;
      const mC = con === 'all' || d.continent === con;
      return mQ && mB && mC;
    });
    currentPage = 1; renderGrid();
  }

  function totalPages() { return Math.max(1, Math.ceil(filtered.length / PER_PAGE)); }

  function renderGrid() {
    const grid  = document.getElementById('destinationsGrid');
    const noRes = document.getElementById('noResults');
    const cnt   = document.getElementById('destCount');
    if (!grid) return;

    if (cnt) cnt.textContent = `${filtered.length} destination${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      grid.innerHTML = '';
      if (noRes) noRes.style.display = 'block';
      document.getElementById('pagination').style.display = 'none';
      return;
    }
    if (noRes) noRes.style.display = 'none';
    document.getElementById('pagination').style.display = 'flex';

    const start = (currentPage - 1) * PER_PAGE;
    const items = filtered.slice(start, start + PER_PAGE);

    grid.innerHTML = items.map((d, i) => `
      <div class="dest-preview-card" style="animation-delay:${i * 0.055}s"
           onclick="openModal(DESTINATIONS.find(x=>x.id==='${d.id}'))">
        <div class="dc-img">
          <img src="${d.image}" alt="${d.name}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=85'">
          <span class="dc-badge ${d.budget}">${d.budget === 'budget' ? 'Budget-Friendly' : d.budget === 'luxury' ? 'Luxury' : 'Moderate'}</span>
          <span class="dc-rating"><i class="fas fa-star"></i>${d.rating}</span>
          <button class="fav-btn ${savedMap[d.id] ? 'active' : ''}"
                  onclick="event.stopPropagation();toggleFav('${d.id}')" title="Save destination"
                  aria-label="${savedMap[d.id] ? 'Remove from saved' : 'Save destination'}">
            <i class="${savedMap[d.id] ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
        <div class="dc-body">
          <h3>${d.name}</h3>
          <div class="dc-meta"><i class="fas fa-map-marker-alt"></i>${[d.country, d.continent].filter(Boolean).join(', ')}</div>
          <div class="dc-tags">${(d.tags || []).slice(0, 3).map(t => `<span class="dc-tag">${t}</span>`).join('')}</div>
          <p>${(d.description || '').substring(0, 95)}…</p>
          <div class="dc-footer">
            <div class="dc-price">From <strong>$${d.costs.daily}/day</strong></div>
            <button class="btn-view">View →</button>
          </div>
        </div>
      </div>`).join('');

    const pi = document.getElementById('pageIndicator');
    if (pi) pi.textContent = `Page ${currentPage} of ${totalPages()}`;
    document.querySelector('.prev-btn').disabled = currentPage === 1;
    document.querySelector('.next-btn').disabled = currentPage === totalPages();
    if (currentPage > 1) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.toggleFav = async function(id) {
    if (!TT.currentUser()) { 
      // Store the destination ID for pending save
      const d = DESTINATIONS.find(x => x.id === id);
      if (d) {
        localStorage.setItem('tt_pending_action', JSON.stringify({
          type: 'saveDest',
          data: { id: d.id, name: d.name, country: d.country, image: d.image, rating: d.rating, budget: d.budget },
          timestamp: Date.now()
        }));
      }
      showToast('Please sign in to save destinations <i class="fas fa-user"></i>', 'info');
      // Show login modal instead of redirecting
      const loginModal = document.getElementById('loginModalOverlay');
      if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      return; 
    }
    const d = DESTINATIONS.find(x => x.id === id);
    if (!d) return;
    if (savedMap[id]) {
      const r = await TT.removeDest(savedMap[id]);
      if (r.ok) showToast(`${d.name} removed.`, 'info');
    } else {
      const r = await TT.saveDest({ id: d.id, name: d.name, country: d.country, continent: d.continent || d.region || '', image: d.image, rating: d.rating, budget: d.budget, description: d.description || '', tags: d.tags || [], highlights: d.highlights || [], tips: d.tips || [], costs: d.costs || {} });
      if (r.ok) showToast(`${d.name} saved! <i class="fas fa-heart"></i>`, 'success');
      else showToast(r.err || 'Could not save.', 'error');
    }
  };
});

// ══════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════
window.openModal = function(d) {
  if (!d) return;
  const modal = document.getElementById('destinationModal');
  if (!modal) return;

  // Hero image
  const hero = modal.querySelector('.modal-hero');
  if (hero) hero.style.backgroundImage = `url(${d.image})`;

  const s = id => document.getElementById(id);

  // Rating & budget pill
  if (s('modalRating')) s('modalRating').textContent = d.rating;
  const bp = s('modalBudgetPill');
  if (bp) {
    bp.className = `modal-budget-pill ${d.budget}`;
    bp.textContent = d.budget === 'budget' ? 'Budget-Friendly' : d.budget === 'luxury' ? 'Luxury' : 'Moderate';
  }

  // Tags row
  if (s('modalTagsRow')) {
    s('modalTagsRow').innerHTML = (d.tags || []).map(t => `<span class="modal-tag">${t}</span>`).join('');
  }

  // Name & location
  if (s('modalDestName')) s('modalDestName').textContent = d.name;
  if (s('modalRegion'))   s('modalRegion').textContent   = [d.country, d.continent].filter(Boolean).join(', ');
  if (s('modalDesc'))     s('modalDesc').textContent     = d.description;

  // Costs
  if (s('modalCosts')) s('modalCosts').innerHTML = `
    <div class="cost-item"><div class="cost-label">Daily Budget</div><div class="cost-value">$${d.costs.daily}/day</div></div>
    <div class="cost-item"><div class="cost-label">Hotel/Night</div><div class="cost-value">$${d.costs.hotel}</div></div>
    <div class="cost-item"><div class="cost-label">Avg. Flight</div><div class="cost-value">$${d.costs.flight}</div></div>`;

  // Highlights & tips
  if (s('highlightsList')) s('highlightsList').innerHTML = (d.highlights || []).map(h => `<li>${h}</li>`).join('');
  if (s('tipsList'))       s('tipsList').innerHTML       = (d.tips || []).map(t => `<li>${t}</li>`).join('');

  // Initialize reviews
  initializeReviewsUI(d.id);

  // Fav button
  const fb = s('modalFavBtn');
  if (fb) { fb.innerHTML = '<i class="far fa-heart"></i> Save Destination'; fb.classList.remove('saved'); fb.onclick = () => toggleModalFav(d); }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  window._openDest = d;
};

// ══════════════════════════════════════════════════════════════
// REVIEWS FUNCTIONALITY
// ══════════════════════════════════════════════════════════════
async function initializeReviewsUI(destId) {
  const s = id => document.getElementById(id);
  
  // Initialize star rating input
  const ratingInput = s('ratingInput');
  if (ratingInput) {
    ratingInput.innerHTML = Array(5).fill(0).map((_, i) => 
      `<button class="star-btn" data-rating="${i + 1}" title="Rate ${i + 1} stars">★</button>`
    ).join('');
    
    const starBtns = ratingInput.querySelectorAll('.star-btn');
    let selectedRating = 0;
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.rating);
        starBtns.forEach((b, i) => {
          b.classList.toggle('active', i < selectedRating);
        });
        s('selectedRating').value = selectedRating;
      });
      btn.addEventListener('mouseenter', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        starBtns.forEach((b, i) => {
          b.style.opacity = i < rating ? '1' : '0.3';
        });
      });
    });
    ratingInput.addEventListener('mouseleave', () => {
      starBtns.forEach(b => b.style.opacity = '1');
    });
  }

  // Create hidden input for selected rating
  if (!s('selectedRating')) {
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'selectedRating';
    hidden.value = '0';
    ratingInput?.parentNode?.appendChild(hidden);
  }

  // Load and display reviews
  await loadAndDisplayReviews(destId);

  // Handle review submission
  const submitBtn = s('submitReviewBtn');
  if (submitBtn) {
    submitBtn.onclick = () => submitReview(destId);
  }

  // Show/hide form based on auth
  TT.onAuthChanged(user => {
    const form = s('reviewForm');
    if (form) {
      form.style.display = user ? 'flex' : 'none';
    }
  });
}

async function loadAndDisplayReviews(destId) {
  try {
    const s = id => document.getElementById(id);
    const reviewsList = s('reviewsList');
    if (!reviewsList) return;

    // Get reviews from Firestore using modular SDK
    const { collection, doc, query, orderBy, getDocs } = await import(
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
    );
    const reviewsRef = collection(TT.db, 'destinations', destId, 'reviews');
    const q = query(reviewsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    let reviews = [];
    snapshot.forEach(d => {
      reviews.push(d.data());
    });

    // Calculate average rating
    if (reviews.length > 0) {
      const avgRating = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);
      if (s('avgRatingScore')) s('avgRatingScore').textContent = avgRating;
      if (s('reviewCount')) s('reviewCount').textContent = reviews.length;
    } else {
      if (s('avgRatingScore')) s('avgRatingScore').textContent = 'N/A';
      if (s('reviewCount')) s('reviewCount').textContent = '0';
    }

    // Render reviews list
    if (reviews.length > 0) {
      reviewsList.innerHTML = reviews.slice(0, 10).map(r => {
        const date = r.timestamp ? new Date(r.timestamp.toDate()).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : 'Recently';
        return `
          <div class="review-item">
            <div class="review-header">
              <div class="review-user-name">${r.userName || 'Traveler'}</div>
              <div class="review-rating-display">
                ${Array(r.rating || 0).fill(0).map(() => '<span class="review-star-display">★</span>').join('')}
              </div>
            </div>
            ${r.comment ? `<div class="review-text">${escapeHtml(r.comment)}</div>` : ''}
            <div class="review-date">${date}</div>
          </div>
        `;
      }).join('');
    } else {
      reviewsList.innerHTML = '<p style="color: var(--gray-500); font-size: 0.9rem; padding: 20px; text-align: center;">Be the first to review this destination!</p>';
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

async function submitReview(destId) {
  if (!TT.currentUser()) {
    showToast('Sign in to leave a review.', 'info');
    return;
  }

  const s = id => document.getElementById(id);
  const rating = parseInt(s('selectedRating')?.value || 0);
  const comment = s('reviewComment')?.value.trim() || '';

  if (rating === 0) {
    showToast('Please select a rating.', 'error');
    return;
  }

  const submitBtn = s('submitReviewBtn');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const { collection, doc, addDoc, serverTimestamp } = await import(
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js'
    );
    const user = TT.currentUser();
    const reviewData = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      rating: rating,
      comment: comment,
      timestamp: serverTimestamp()
    };

    const reviewsRef = collection(TT.db, 'destinations', destId, 'reviews');
    await addDoc(reviewsRef, reviewData);

    showToast('Review submitted! Thank you! 🙏', 'success');
    
    // Clear form
    if (s('selectedRating')) s('selectedRating').value = '0';
    if (s('reviewComment')) s('reviewComment').value = '';
    
    // Reset star buttons
    document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));

    // Reload reviews
    await loadAndDisplayReviews(destId);
  } catch (error) {
    console.error('Error submitting review:', error);
    showToast('Could not submit review. Try again.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.closeModal = function() {
  document.getElementById('destinationModal')?.classList.remove('open');
  document.body.style.overflow = '';
};

document.addEventListener('DOMContentLoaded', () => {
  // Close button
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  
  // Click outside modal
  document.getElementById('destinationModal')?.addEventListener('click', function(e) { 
    if (e.target === this) closeModal(); 
  });
});

document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') closeModal(); 
});

async function toggleModalFav(d) {
  if (!TT.currentUser()) { 
    // Store the destination for pending save
    localStorage.setItem('tt_pending_action', JSON.stringify({
      type: 'saveDest',
      data: { id: d.id, name: d.name, country: d.country, image: d.image, rating: d.rating, budget: d.budget },
      timestamp: Date.now()
    }));
    showToast('Please sign in to save <i class="fas fa-user"></i>', 'info');
    const loginModal = document.getElementById('loginModalOverlay');
    if (loginModal) {
      loginModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    return; 
  }
  const r = await TT.saveDest({ id: d.id, name: d.name, country: d.country, image: d.image, rating: d.rating, budget: d.budget });
  const btn = document.getElementById('modalFavBtn');
  if (r.ok) {
    showToast(`${d.name} saved! <i class="fas fa-heart"></i>`, 'success');
    if (btn) { btn.innerHTML = '<i class="fas fa-heart"></i> Saved'; btn.classList.add('saved'); }
  } else { showToast(r.err || 'Could not save.', 'error'); }
}

window.goToCalculator = function() {
  closeModal();
  const d = window._openDest;
  const inPages = window.location.pathname.includes('/pages/');
  const base = inPages ? 'calculator.html' : 'pages/calculator.html';
  window.location.href = d ? `${base}?dest=${encodeURIComponent(d.name)}&daily=${d.costs.daily}` : base;
};

// Render saved destinations panel
function renderSavedPanel(saved) {
  const body = document.getElementById('savedPanelBody');
  if (!body) return;
  
  if (!saved || saved.length === 0) {
    body.innerHTML = '<div class="saved-panel-empty"><i class="fas fa-heart"></i><p>No saved places yet.<br>Tap the heart on any destination!</p></div>';
    return;
  }
  
  body.innerHTML = saved.map(s => `
    <div class="sp-card" data-id="${s.id}">
      <div class="sp-img"><img src="${s.image}" alt="${s.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=700&q=85'"></div>
      <div class="sp-info">
        <div class="sp-name">${s.name}</div>
        <div class="sp-country"><i class="fas fa-map-marker-alt"></i> ${s.country}</div>
      </div>
      <div class="sp-actions">
        <button class="sp-explore" onclick="openModal(DESTINATIONS.find(x=>x.id==='${s.id}'))" title="View details" aria-label="View ${s.name} details">
          <i class="fas fa-map" aria-hidden="true"></i>
        </button>
        <button class="sp-remove" onclick="removeSavedItem('${s.docId}', '${s.name}')" title="Remove" aria-label="Remove ${s.name}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.removeSavedItem = async function(docId, name) {
  if (confirm(`Remove ${name} from saved places?`)) {
    const r = await TT.removeDest(docId);
    if (r.ok) showToast(`${name} removed.`, 'info');
    else showToast(r.err || 'Could not remove.', 'error');
  }
};

// Saved panel event listeners
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('savedPanelClose');
  const overlay = document.getElementById('savedPanelOverlay');
  if (closeBtn) closeBtn.addEventListener('click', () => {
    const panel = document.getElementById('savedPanel');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  });
  if (overlay) overlay.addEventListener('click', () => {
    const panel = document.getElementById('savedPanel');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  });
  
  // Open saved panel on heart icon or button (if you add one)
  window.openSavedPanel = function() {
    const panel = document.getElementById('savedPanel');
    const overlay = document.getElementById('savedPanelOverlay');
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
  };
});