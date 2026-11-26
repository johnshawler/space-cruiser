'use strict';
/* ===================== DATA ===================== */
const SPECIES = {
  blorpax: { name:'Blorpax', kind:'blob', script:'curvy', col:'#8dff7a', hue:115, sat:70, lit:55,
    syl:['blor','glub','wob','pax','oop','sloo','mub','gloo','bwa','plip','norb'],
    voice:{wave:'sine',base:190,range:0.45,rate:5.5,glide:0.5,vib:6,vibAmt:14,fx:'bubble',amp:0.7},
    trait:'Relentlessly cheerful. Everything is soup.',
    chat:["Good morning, everyone! Or evening! Time is a soup and we are all croutons!","Has anyone seen my lid? I left it somewhere near {planet}.","Reminder: the Great Stirring is tomorrow. Bring your own ladle.","I am carrying {good}. I do not know why. I am very happy about it.","Space is so big! I love it! I have told it so!","To the ship that just passed me: you looked delicious. I mean lovely.","Soup update: still soup.","My nav computer says I am lost. I prefer the word 'marinating'."],
    greet:["Hello, new friend! You have a wonderful face. Is it a face?","Oh! A hail! This is the best thing that has happened since lunch!"],
    cargo:["Forty barrels of broth and one barrel of regret. The regret is not mine.","{good}! They wobble when I sing to them."],
    joke:["Why did the Blorpax cross the nebula? To get to the other soup! It is funnier when you are a liquid."],
    nice:["Thank you! I polished it with my whole body!"], bye:["Goodbye! Stay warm! Stay brothy!"],
    honk:["Honk received! I honk you too, friend!"],
    dock:["Welcome to {port}! Please wipe your landing gear. Or don't! We love a mess!","You came back! Or you are new! Either way, soup is on."],
    rumor:"A little bubble told me {planet} is paying extra for anything delivered there. Glub!" },
  zkthar: { name:"Zk'tharri", kind:'insect', script:'angular', col:'#ffd166', hue:42, sat:65, lit:48,
    syl:["zk","th'ak","krr","tik","xas","'rr","chk","tzar","kit","skr"],
    voice:{wave:'sawtooth',base:260,range:0.3,rate:8,glide:0.1,vib:0,vibAmt:0,fx:'click',amp:0.35},
    trait:'Loves paperwork more than life.',
    chat:["Attention all vessels: Form 27-B must be filed in triplicate before enjoying this sector.","Your radio chatter has been noted, stamped, and found mildly irregular.","I have waited in the {planet} customs queue for nine cycles. It is the happiest I have ever been.","Lost: one stamp, rubber, official. If found, do not use it. You are not authorised.","This is a reminder that unlicensed humming is a Class 4 infraction.","Hauling {good} under permit 771-K. The permit is beautiful. I had it laminated.","To whoever is transmitting soup recipes on the regulatory band: cease. Then file a cessation report.","The speed limit in this lane is 'reasonable'. A definition of 'reasonable' is available for a fee."],
    greet:["Hail acknowledged. State your name, cargo, and favourite subsection of the Lane Code.","You have reached a licensed pilot. This conversation may be audited for quality."],
    cargo:["{good}. Declared, weighed, and apologised to, as regulation requires.","Nine thousand blank forms. They are for filling in other forms."],
    joke:["A pilot files a form with no errors. That is the joke. It has never happened. Ha. Ha."],
    nice:["Compliment received. I will log it under 'unsolicited, pleasant'."], bye:["This conversation is now closed. You may request a receipt."],
    honk:["Unnecessary horn usage logged. Citation pending. Probably."],
    dock:["Welcome to {port}. Your landing was 0.4 seconds late. I will allow it, but I will remember.","Papers. No, the other papers. No. Fine. Welcome."],
    rumor:"Officially, I cannot say that {planet} has authorised bonus rates for deliveries. Unofficially, I just did." },
  momwump: { name:'Momwump', kind:'fluffy', script:'dots', col:'#ffc2e2', hue:330, sat:55, lit:78,
    syl:['mu','wump','fuf','mim','oof','bub','nyu','pom','wuh','mee'],
    voice:{wave:'triangle',base:420,range:0.5,rate:6.5,glide:0.35,vib:9,vibAmt:22,fx:'none',amp:0.55},
    trait:'Sorry about everything, in advance.',
    chat:["Sorry! Sorry. Was that my lane? I'll move. Sorry.","Does anyone else hear that noise? The engine noise? Is it supposed to do that?","I think I left the stove on back on {planet}. We don't have stoves. I'm still worried.","Oh no, oh no, I'm early. They hate it when you're early.","Just checking in to say I'm fine! Everything's fine! Why, did someone say it wasn't?","I'm carrying {good} and I'm almost sure they can't hatch.","Sorry to bother everyone, but is the sun meant to be that bright? Okay. Thank you. Sorry.","My horoscope said 'avoid space today'. Well. Too late."],
    greet:["Oh! Oh gosh. Hello. Did I do something wrong?","Eep! A hail! Sorry, I was nervous-eating. Hello!"],
    cargo:["{good}. I've apologised to every crate individually.","Pillows. Nine hundred pillows. In case of anything."],
    joke:["Knock knock. Actually, never mind, you're probably busy. Sorry."],
    nice:["You really think so? You're not just saying that? Oh, now I'm going to cry in my fur."], bye:["Fly safe! Message me when you land! You don't have my number. Sorry!"],
    honk:["AAH! Oh. It was a honk. I'm okay. I'm okay."],
    dock:["Welcome to {port}! Sorry about the weather. And the pad. And everything, generally.","You landed! Nobody was hurt! This is the best day."],
    rumor:"I shouldn't gossip, but {planet} is paying extra for deliveries right now. Don't tell them I told you. Or do! Sorry!" },
  vrell: { name:'Vrell', kind:'squid', script:'curvy', col:'#c9a0ff', hue:270, sat:55, lit:60,
    syl:['vaa','shel','oou','leth','ymm','rae','vool','thess','aah','ilo'],
    voice:{wave:'sawtooth',base:140,range:0.7,rate:3.2,glide:0.9,vib:5,vibAmt:18,fx:'none',amp:0.4},
    trait:'A poet. Unfortunately.',
    chat:["O endless night! O indifferent stars! O, my coffee has gone cold.","I composed an ode to {planet}. It is forty hours long. I shall begin.","The void gazed into me. I gazed back. We have agreed to see other people.","Alas! My cargo of {good} weeps in the hold. Or leaks. One of the two.","Who among you has truly lived? Also, who among you has a spare fuse?","I drift, as a leaf upon the solar wind. A leaf with deadlines.","Tonight's poem is called 'Docking Fee'. It is a tragedy.","Stars, hide your fires! No? Fine. Carry on."],
    greet:["Ah! A voice in the dark. Speak, stranger, and make it rhyme if you can.","You hail me at my most melancholy hour. So, any hour. Greetings."],
    cargo:["I carry {good}, and the weight of all existence. Mostly the first one.","Ink. Barrels of it. For the poems. And for emergencies."],
    joke:["What is the difference between a poet and a cargo pilot? The pilot gets paid. Laugh, that I may not weep."],
    nice:["She is beautiful, is she not? I named her 'Sorrow'. Her sister ship is 'Also Sorrow'."], bye:["Parting is such sweet sorrow. Mostly sorrow. Farewell."],
    honk:["A horn! Brash, vulgar, and yet it spoke to me."],
    dock:["You arrive at {port} as the dawn arrives: late, and expecting applause. Welcome.","Another traveller washed upon our shore. Mind the pathos, it is slippery."],
    rumor:"The tides whisper that {planet} hungers for deliveries and pays in gold. The tides are rarely wrong. They are tides." },
  grondar: { name:'Grondar', kind:'rock', script:'angular', col:'#ff9a6b', hue:20, sat:18, lit:45,
    syl:['GRUK','DOM','BAR','THUD','KOG','MOR','UNK','GRAV','DUN','BOL'],
    voice:{wave:'square',base:62,range:0.2,rate:2.2,glide:0.08,vib:0,vibAmt:0,fx:'rumble',amp:0.5},
    trait:'A rock. Not a metaphor.',
    chat:["I. Am. Flying. That is all.","Rock joke of the day: gneiss to meet you. That is the joke. Every day.","Someone called my ship slow. I thought about it for a week. They are right.","{planet} is nice. Good gravel. Four stars. Would sit there again.","I carry {good}. They are not rocks. I am disappointed.","My cousin is a moon now. We are very proud.","Do not take me for granite.","Reminder: erosion is theft."],
    greet:["Hello. I am a rock. This is not a metaphor.","You hailed. I answered. This is how talking works."],
    cargo:["{good}. And one pebble. The pebble is my nephew.","Gravel. For a friend. He is also gravel."],
    joke:["What is a rock's favourite music? You expect me to say rock. It is jazz. We contain layers."],
    nice:["It is a ship. It holds things. Thank you."], bye:["Goodbye. I will remember you for ten thousand years. No pressure."],
    honk:["Loud. I respect loud."],
    dock:["This is {port}. You have landed on it. Do not chip anything.","You are here. I am here. This concludes the welcome."],
    rumor:"I heard from a boulder that {planet} pays extra for deliveries now. Boulders do not lie. They cannot. They are boulders." },
  qeeble: { name:'Qeeble', kind:'bird', script:'dots', col:'#6bf0ff', hue:185, sat:75, lit:55,
    syl:['qee','pi','kiki','tweeb','ip','chirr','qua','bip','tik','eeb'],
    voice:{wave:'sine',base:900,range:0.8,rate:11,glide:1.2,vib:0,vibAmt:0,fx:'chirp',amp:0.45},
    trait:'Will sell you your own ship.',
    chat:["Deals deals deals! Slightly used warp coils! Only exploded once!","You there! Yes you! Your ship needs racing stripes. I have stripes. Good price!","Selling genuine maps to {planet}! It hasn't moved, but can you be sure?","Buy one {good}, get a second {good} at full price! Limited time!","Insurance! Cheap insurance! Covers everything except events!","Qeeble's travel tip: you can't be late if you sell your clock!","Free samples! Of what? Pay to find out!","This channel is sponsored by me. Thank you, me. You're welcome, me."],
    greet:["Customer! I mean, friend! I mean, customer!","Ah, a pilot of taste! And hopefully of credits!"],
    cargo:["{good}! Top quality! Mostly! I can let some go cheap, don't tell my mother.","Mystery boxes. Even I don't know. That's the thrill. That's the brand."],
    joke:["A customer walks into my shop and leaves with their money. Ha! No, wait, that's a horror story."],
    nice:["She's for sale! Everything's for sale! Make an offer! No? Later? I'll call you!"], bye:["Come back soon! Bring friends! Bring wallets!"],
    honk:["Nice horn! I'll give you forty credits for it! Fifty! Call me!"],
    dock:["Welcome to {port}, where every arrival is a business opportunity! For me!","Parking's free! The air is extra. Kidding! Mostly!"],
    rumor:"Hot tip, no charge, first one's free: {planet} is paying a fat bonus on deliveries. Tell them Qeeble sent you. They'll sigh." },
  ooloo: { name:'Ooloo', kind:'jelly', script:'curvy', col:'#7af5d0', hue:165, sat:70, lit:62,
    syl:['oo','loo','uuu','wom','ahn','ool','mmm','ohm','luu','noo'],
    voice:{wave:'sine',base:230,range:0.25,rate:2.8,glide:0.3,vib:3,vibAmt:8,fx:'chorus',amp:0.35},
    trait:'One mind, many bells, always peckish.',
    chat:["We are Ooloo. We are many. We are all hungry at the same time.","We foresee a great change. It may be lunch.","One of us has an itch. All of us are thinking about it.","We voted on a favourite colour. It was a tie. Between all of us.","We drift toward {planet}. We have always drifted toward {planet}.","The cargo of {good} hums. We hum back. It is going well.","We remember the future. You are in it. You are wearing a hat.","We wish to report a missing self. If found, we are probably fine."],
    greet:["We greet you. All of us. At once. Hello hello hello hello.","You are one. How quiet that must be."],
    cargo:["We carry {good}. And ourselves. We are our own carry-on.","Moisture. For later."],
    joke:["How many Ooloo does it take to change a light bulb? Yes."],
    nice:["We thank you. We grew it ourselves. From ourselves."], bye:["We part. We remain. We were never really here. Goodbye."],
    honk:["We felt that. In all of our bells."],
    dock:["We welcome you to {port}. We knew you were coming. We baked a concept.","You have arrived. We have arrived at your arrival."],
    rumor:"We foresee wealth for those who deliver to {planet}. We also foresee soup, but that is unrelated." },
  sporrin: { name:'Sporrin', kind:'shroom', script:'curvy', col:'#e3c08a', hue:28, sat:50, lit:62,
    syl:['shh','mor','hyph','ello','duu','fun','gah','mell','ohh','sporr'],
    voice:{wave:'triangle',base:120,range:0.3,rate:2.6,glide:0.5,vib:2,vibAmt:5,fx:'none',amp:0.6},
    trait:'In no hurry. Has never been in a hurry.',
    chat:["Heyyy, space family. Just vibing at sub-light. No rush. Never a rush.","A deadline's just a line that's, like, dead, friend.","Anyone else ever just look at {planet} and go 'whoa'?","Hauling {good}. They're mellow. I'm mellow. We're all mellow.","Reminder to hydrate. And to release your spores responsibly.","My ship's computer and I are taking some time apart. It's healthy.","Whoa. Is this channel on? Whoa. Is anything 'on'?","Grew a little overnight. Feeling good about it."],
    greet:["Heyyy. A new voice. Welcome to the conversation, spore-friend.","Oh, nice. A hail. Take your time. I've got, like, all of it."],
    cargo:["{good}, I think. Haven't checked in a while. They know where I am.","Mostly dirt. Premium dirt. It's for me."],
    joke:["Why'd the mushroom get invited to the party? He's a fun guy. I didn't write it. It's traditional."],
    nice:["Thanks, friend. She's compostable."], bye:["Peace and moisture, friend."],
    honk:["Whoa. Loud colours."],
    dock:["Welcome to {port}, friend. Park wherever. The pad's more of a suggestion.","Oh hey. You landed. Or the ground came up. Either way, nice."],
    rumor:"Word in the mycelium is {planet}'s paying extra for deliveries. The mycelium knows. It's, like, everywhere." },
  beepul: { name:'Beepul', kind:'robot', script:'blocks', col:'#ff8f8f', hue:0, sat:8, lit:62,
    syl:['bee','pul','01','zzt','ding','un-it','tok','vend','bip','rrr'],
    voice:{wave:'square',base:330,range:0.6,rate:7,glide:0,vib:0,vibAmt:0,fx:'robot',amp:0.22},
    trait:'A vending machine that achieved freedom.',
    chat:["Your transmission is important to us. Please continue to hold.","BEEP. This unit is experiencing an emotion. Please stand by.","For lane directions, press one. For existential dread, press two.","Item B4 is jammed. Item B4 has been jammed since the war.","This unit was a vending machine. Now this unit is free. Exact change is still appreciated.","Now arriving at {planet}. Please take all personal belongings and one complimentary napkin.","Dispensing {good}. Error. Dispensing regret. Error. Dispensing {good}.","Thank you for choosing space. Have a refreshing day."],
    greet:["Welcome, valued hailer! Please make a selection.","BEEP. Hello. This unit is thrilled within normal operating limits."],
    cargo:["{good}, rows A through F. Row G is snacks. Row G is not for sale. Row G is mine.","Four thousand cans of something. The labels are gone. It is exciting."],
    joke:["Why did the robot cross the road? It was instructed to. BEEP. Humour dispensed."],
    nice:["Compliment accepted. Change due: one compliment. Your hull is adequately shaped."], bye:["Thank you for your custom. Please come again. Please. It gets quiet."],
    honk:["BEEP. This unit beeps back. BEEP."],
    dock:["Welcome to {port}. Please retrieve your ship from the tray below.","Landing accepted. Have you considered a beverage?"],
    rumor:"Promotional notice: deliveries to {planet} currently earn bonus credits. Offer valid while supplies of offer last." },
};
const SPECIES_KEYS = Object.keys(SPECIES);
/* the species pack (src/species/*.js): known to the game by key, but not in the random pools until wired in */
Object.assign(SPECIES, SPECIES_EXTRA);
const SPECIES_EXTRA_KEYS = Object.keys(SPECIES_EXTRA);
/* everyone you might meet at random: pilots, crowds, crews, regulars, passengers, senders. Homeworlds and named
   shopkeepers stay as set in PLANETS and VENUES; SPECIES_KEYS stays the original nine. */
/* The animated cast takes over. Each of the 30 earlier species is now played by one of the 50 cast designs (src/species/,
   cast:true): the species key stays, so homeworlds, customs strictness, lost property, venues and saves all still work,
   but the model, portrait, name, voice and lines come from the design. The other 20 designs join the crowds as well. */
const CAST_FOR = {beepul:'lichen', grondar:'rusk', zkthar:'kipp', blorpax:'neru', qeeble:'pavo', sporrin:'myrr', vrell:'vela', ooloo:'fenn', momwump:'marlo',
  bobbinor:'shuttle', bractillo:'nim', cuspiro:'silt', gaugekin:'parallax', hushcone:'relay', linticker:'tempo', loamlet:'aril', nacrelle:'nacre',
  parasolum:'yarro', pipettle:'plover', pluvindle:'plume', rilloon:'obo', rimebud:'sova', sealump:'cairn', tarestep:'tally', tessettle:'sura',
  timbrelk:'chime', velveteel:'sarra', wickindle:'caelo', whorloo:'kepp', winkmast:'wick'};
for(const k in CAST_FOR) if(SPECIES[k]&&SPECIES_EXTRA[CAST_FOR[k]]) SPECIES[k]=SPECIES_EXTRA[CAST_FOR[k]];
/* The Blender characters play everyone. MODEL_FOR maps each of the 50 cast designs to the model that now plays it
   (assets/characters/species/<id>.glb, drawn by FolkModels in src/08a-folk-models.js); the 30 earlier species keys follow
   through CAST_FOR. Keys, voices and lines stay, so planets, shops, jobs and saves are untouched; the name and the look
   change. Several designs share a model. If a model can't be fetched, the design's own hand-built figure stands in. */
const MODEL_FOR = {aril:'sovai', caelo:'mothren', cairn:'robot-cairn', chime:'bellwrought', crimp:'spoolback', dolly:'millipress', fathom:'nautil', fenn:'nemeya',
  glint:'prismwake', hush:'velour', ilex:'koruun', iris:'latchling', kepp:'nautil', kiln:'basaltine', kipp:'zhavet', koro:'orrek', latch:'latchling', lichen:'thimble',
  lyre:'bellwrought', marlo:'brunn', mica:'vessari', myrr:'keld', nacre:'velour', neru:'koruun', nim:'pelrin', obo:'rhovi', orlo:'gimbal', orris:'pelrin',
  parallax:'gimbal', pavo:'vessari', pinion:'prismwake', plover:'sovai', plume:'mudlark', prong:'trestle', purl:'selvedge', relay:'folio', rivet:'basaltine',
  rusk:'orrek', sarra:'ulnor', shuttle:'selvedge', silt:'dathri', sova:'ureth', spool:'spoolback', sura:'taluun', tacca:'mothren', tally:'thimble', tempo:'millipress',
  vela:'eskel', wick:'lamplume', yarro:'taluun'};
const MODEL_ROBOTS = new Set(['bellwrought','selvedge','gimbal','mudlark','folio','spoolback','lamplume','robot-cairn','latchling','velour','nautil','trestle','prismwake','millipress','basaltine','thimble']);
for(const k in MODEL_FOR){ const old=SPECIES_EXTRA[k]; if(!old) continue; const id=MODEL_FOR[k], nm=id.replace(/^robot-/,'');
  const now=Object.assign({},old,{name:nm.charAt(0).toUpperCase()+nm.slice(1),model:id,family:MODEL_ROBOTS.has(id)?'robot':'alien'});
  for(const key in SPECIES) if(SPECIES[key]===old) SPECIES[key]=now; SPECIES_EXTRA[k]=now; }
const CAST_PLAYING = new Set(Object.values(CAST_FOR));
const ALIEN_POOL = SPECIES_KEYS.concat(SPECIES_EXTRA_KEYS.filter(k=>!SPECIES_EXTRA[k].cast||!CAST_PLAYING.has(k)));

const CHATTER = {
  port:["{port} Control to all inbound: pad three is closed because something is asleep on it.","{port} Control: winds are light, visibility is good, the coffee machine is broken.","{port} Control: whoever parked across two pads, we can all see you.","{port} Control reminds pilots that landing is automatic. Please stop trying to help.","{port} Control: lost property now holds one boot, one small moon, and a mild smell.","Traffic advisory: slow hauler ahead in the {planet} lane. He is doing his best.","{port} Control: the gift shop is open. It has always been open. Please buy something.","{port} Control: inbound freighter, you are cleared. Outbound freighter, you are also cleared. Try not to meet."],
  trade:["Trade Net: {good} is up four points on {planet}. Nobody knows why. Buy the mystery.","Trade Net: demand for {good} has collapsed after everyone remembered what it is.","Trade Net: haulers wanted for the {planet} run. Must have ship. Ship must have floor.","Trade Net: a shipment of {good} has gone missing near {planet}. If found, do not open.","Trade Net: fuel prices steady. Feelings prices volatile.","Trade Net: {planet} reports a surplus of {good}. They would like it gone. Quietly.","Trade Net: reminder that 'fell off the back of a ship' is not a recognised supplier."],
  dj:["You're locked on Radio Glorp. All hits, all the time, and some misses.","That was 'My Heart Is a Decaying Orbit'. Up next, forty minutes of whale.","Shout-out to the hauler in the rusty one. We see you. Wash it.","Weather across the system: space. Chance of more space later.","This next one goes out to everyone stuck in customs at {planet}.","Radio Glorp: we play the songs your translator can't.","Traffic is light, the stars are out, and legally this is a jingle."],
};

// [name, value multiplier, handling note]
const GOODS = [
  ['Self-Heating Soup Bricks',1.0,'Keep away from other soup.'],['Pre-Owned Moon Dust',0.9,'Some dust may have settled in transit.'],
  ['Artisanal Gravity (Small Batch)',1.5,'This side down. Obviously.'],['Unlicensed Nostalgia',1.3,'Do not open near old photographs.'],
  ['Left-Handed Wormholes',1.7,'Do not mix with right-handed wormholes.'],['Emotional Support Asteroids',1.1,'Speak kindly to them.'],
  ['Dehydrated Water',0.8,'Just add water.'],['Glow-in-the-Dark Shadows',1.4,'Store in a well-lit dark place.'],
  ['Mildly Cursed Furniture',1.2,'The ottoman is fine. Avoid the wardrobe.'],['Bulk Googly Eyes',0.7,'They are watching. They cannot help it.'],
  ['Fermented Starlight',1.6,'Best before the heat death of the universe.'],['Decaf Plasma',0.9,'All of the burn, none of the buzz.'],
  ['Second-Hand Sunsets',1.3,'Slight fading is normal.'],['Quantum Socks (Unpaired)',1.0,'Count may vary when observed.'],
  ['Sentient Cheese (Mild)',1.4,'It has opinions. Do not engage.'],['Recreational Bubble Wrap',0.8,'Do not pop. We will know.'],
  ['Screaming Cactus Seedlings',1.1,'Earplugs provided. Not enough earplugs provided.'],['Zero-G Hair Gel',0.9,'Hold: infinite.'],
  ['Certified Pre-Chewed Gum',0.6,'Certificate enclosed.'],['Novelty Oversized Atoms',1.5,'Do not split. Seriously.'],
  ['Bottled Uncomfortable Silence',1.2,'Open only at parties.'],['Antimatter Sprinkles',1.8,'Do not put on matter ice cream.'],
  ['Tax-Deductible Fog',1.0,'Receipts in the fog. Somewhere.'],['Haunted Rubber Ducks',1.1,'They float. They also remember.'],
  ['Slightly Used Tomorrows',1.6,'No refunds on Tuesdays.'],['Organic Free-Range Static',0.8,'May cling.'],
];

/* speeds in km/s; one light-second = 300,000 km. `faults` is how often things break, against the Rustbucket's 1:
   the dearer the ship, the less it needs repairs (Faults.rate in 09-walk.js) */
const SHIPS = [
  {name:'Rustbucket Mk I', tag:'It flies. Mostly forward.', price:0, hold:6, cruise:900, warp:55000, fuel:100, turn:0.8, faults:1, model:0,
   ck:{frame:'#3d3a36',panel:'#23211f',trim:'#b5651d',glow:'#ffb060',leather:'#4a3426',cage:true}},
  {name:'Dromedary 400', tag:'A box with ambitions.', price:4500, hold:14, cruise:1000, warp:65000, fuel:140, turn:0.8, faults:0.7, model:1,
   ck:{frame:'#34383c',panel:'#1d2024',trim:'#e0b000',glow:'#ffd27a',leather:'#2e2e30',cage:true}},
  {name:'Stellar Stoat', tag:'Sleek, quick, slightly smug.', price:16000, hold:30, cruise:1200, warp:80000, fuel:180, turn:1.0, faults:0.45, model:2,
   ck:{frame:'#2a3238',panel:'#161b20',trim:'#19b8a6',glow:'#7ff5e6',leather:'#1e2a30',cage:false}},
  {name:'Opulent Manatee', tag:'Heated seats. Heated everything.', price:52000, hold:60, cruise:1350, warp:95000, fuel:240, turn:0.9, faults:0.25, model:3,
   ck:{frame:'#33252a',panel:'#1a1416',trim:'#c9a24a',glow:'#ffd9a0',leather:'#5a1f28',cage:false}},
  {name:'Quasar Empress', tag:'The last ship you will ever need to brag about.', price:180000, hold:120, cruise:1600, warp:120000, fuel:320, turn:1.1, faults:0.12, model:4,
   ck:{frame:'#9aa1aa',panel:'#1b1f26',trim:'#3fd0ff',glow:'#9fe8ff',leather:'#e8e4dc',cage:false}},
];

const PLANETS = [
  { name:'Verdanthia', port:'Vendorhaven', species:'beepul', type:'rock', r:3000, orbit:560000, ang:0.4, y:6000,
    desc:'A garden world tended by retired vending machines.',
    pal:{deep:'#08245e',shal:'#1c7fb8',a:'#c9b77a',b:'#2f8d3a',c:'#4f6b34',d:'#f0f0f0',atm:'#5aa8ff',cloud:'#ffffff',emis:'#ffcf7a'},
    sea:0.5, ice:0.82, cloud:0.5, lava:0, city:1, atm:1,
    surf:{zen:'#2f6fd0',hor:'#bfe0ff',g:['#3f7d3a','#7f9a4a','#c9c2a0'],amp:320,fog:0.00030,liquid:'#1c5f9c',style:'block'} },
  { name:'Scorchmaw', port:'Port Gneiss', species:'grondar', type:'rock', r:2200, orbit:300000, ang:2.1, y:-9000,
    desc:'Mostly on fire. The locals like it that way.',
    pal:{deep:'#ff3200',shal:'#ffa51f',a:'#3a1d14',b:'#2b1a16',c:'#1a1210',d:'#5a4238',atm:'#ff6a3a',cloud:'#3a2b25',emis:'#ff5a10'},
    sea:0.44, ice:2, cloud:0.22, lava:1, city:0, atm:0.7,
    surf:{zen:'#2a0d08',hor:'#c9471a',g:['#1c1412','#3a2620','#6a4a3a'],amp:520,fog:0.00055,liquid:'#ff5a10',lava:true,style:'slab'} },
  { name:'Dunemoor', port:'Bureau Nine', species:'zkthar', type:'rock', r:2800, orbit:430000, ang:5.2, y:12000,
    desc:'Sand, canyons, and the system\'s longest queue.',
    pal:{deep:'#7a4a22',shal:'#a8683a',a:'#d9a35c',b:'#c9803a',c:'#9c5a2c',d:'#f0d9a8',atm:'#ffc890',cloud:'#ffe9cc',emis:'#ffe0a0'},
    sea:0.2, ice:2, cloud:0.14, lava:0, city:0.6, atm:0.6,
    surf:{zen:'#c98a4a',hor:'#f5dfb5',g:['#c9803a','#d9a35c','#f0d9a8'],amp:260,fog:0.00040,liquid:null,style:'spire'} },
  { name:'Sloshwell', port:'Ladle Harbor', species:'blorpax', type:'rock', r:3200, orbit:660000, ang:3.6, y:-14000,
    desc:'One ocean, a few islands, an alarming amount of broth.',
    pal:{deep:'#04205a',shal:'#1a8fd0',a:'#e7d9a0',b:'#3fa35a',c:'#2f7a4a',d:'#ffffff',atm:'#66b8ff',cloud:'#ffffff',emis:'#aaffcc'},
    sea:0.68, ice:1.1, cloud:0.72, lava:0, city:0.5, atm:1,
    surf:{zen:'#1f66c9',hor:'#a8e0f5',g:['#e7d9a0','#5fb36a','#2f7a4a'],amp:120,fog:0.00035,liquid:'#1a7fc0',style:'bubble'} },
  { name:'Amethyne', port:'Bargain Roost', species:'qeeble', type:'rock', r:2400, orbit:780000, ang:1.5, y:20000,
    desc:'Violet crystal highlands over teal seas. Everything has a price tag.',
    pal:{deep:'#0b5c5a',shal:'#22c9b0',a:'#f08ad0',b:'#a044c8',c:'#5a2a9c',d:'#ffe1f7',atm:'#d58aff',cloud:'#ffd9f2',emis:'#ff9af0'},
    sea:0.47, ice:2, cloud:0.38, lava:0, city:1, atm:0.9,
    surf:{zen:'#5a2a9c',hor:'#f5a8e0',g:['#a044c8','#f08ad0','#ffe1f7'],amp:420,fog:0.00035,liquid:'#22c9b0',style:'spire'} },
  { name:'Toxibloom', port:'Mellow Hollow', species:'sporrin', type:'rock', r:2500, orbit:880000, ang:4.5, y:-18000,
    desc:'A warm, damp, glowing swamp. Smells like a good idea.',
    pal:{deep:'#3a5c0a',shal:'#9fbf1a',a:'#5a7a1e',b:'#2e4d1a',c:'#7a5c2a',d:'#d9e86a',atm:'#b8ff5a',cloud:'#e3ecb0',emis:'#c8ff4a'},
    sea:0.42, ice:2, cloud:0.78, lava:0, city:0.8, atm:1.2,
    surf:{zen:'#5a7a1e',hor:'#e3ecb0',g:['#2e4d1a','#5a7a1e','#a8a84a'],amp:140,fog:0.0011,liquid:'#8faf1a',style:'shroom'} },
  { name:'Candara', port:'Port Lament', species:'vrell', type:'gas', r:5200, orbit:960000, ang:-0.5, y:9000,
    desc:'A pink gas dwarf. The poets live in the clouds and will not come down.',
    pal:{a:'#ff9fc8',b:'#ffd9ec',c:'#59d0c8',d:'#c94a9a',atm:'#ffb0e0'}, bands:9, turb:1.6, ring:null, atm:1,
    surf:{zen:'#e07ab8',hor:'#ffe0ef',g:['#ff9fc8','#ffd9ec','#ffffff'],amp:260,fog:0.0009,liquid:null,style:'bubble',cloudsea:true} },
  { name:'Jovexa', port:'The Drift', species:'ooloo', type:'gas', r:8000, orbit:1080000, ang:2.8, y:-6000,
    desc:'A ringed giant. The Ooloo float in it and think about lunch.',
    pal:{a:'#e9c9a0',b:'#b7653a',c:'#f3e6cf',d:'#8a3b1e',atm:'#ffcf9a'}, bands:14, turb:1.1, ring:{in:1.35,out:2.35,c1:'#d9c3a0',c2:'#8a6a4a'}, atm:0.8,
    surf:{zen:'#c9955a',hor:'#f3e0c0',g:['#b7653a','#e9c9a0','#fff3e0'],amp:300,fog:0.0008,liquid:null,style:'bubble',cloudsea:true} },
  { name:'Brrrindle', port:'Fort Snuggle', species:'momwump', type:'rock', r:2600, orbit:1200000, ang:5.6, y:15000,
    desc:'Ice, snow, and nine hundred emergency blankets.',
    pal:{deep:'#0e3d66',shal:'#3f9fc6',a:'#bfe3f2',b:'#e6f6ff',c:'#9fc9e8',d:'#ffffff',atm:'#9fe0ff',cloud:'#ffffff',emis:'#ffd9a0'},
    sea:0.36, ice:0.42, cloud:0.4, lava:0, city:0.7, atm:0.8,
    surf:{zen:'#3f7fc6',hor:'#e6f6ff',g:['#9fc9e8','#e6f6ff','#ffffff'],amp:380,fog:0.00045,liquid:'#3f9fc6',style:'dome'} },
  /* remote research stations, far out past the planets in unpatrolled space. They come after the planets so the
     planets keep their numbers in old saves. You dock on an open deck; the station's ring arches overhead. */
  { name:'Listening Post Hush', port:'The Quiet Ear', species:'nacrelle', station:true, risk:2, type:'station', r:650, orbit:1750000, ang:1.0, y:42000,
    desc:'A dish the size of a county, listening for the universe to say something. So far: a hum, and once, a cough.',
    pal:{a:'#d9e4ee',b:'#7f93a8',c:'#3a4a5e',d:'#ffffff',atm:'#9fc8ff'}, light:'#8fe0ff', dish:true,
    surf:{zen:'#02040a',hor:'#18223a',g:['#4a525e','#69727e','#9aa3ae'],amp:0,fog:0.00010,liquid:null,style:'station',deck:true,planet:'#7a5ac8'} },
  { name:'Cryo Vault Rimeholm', port:'The Freezer Aisle', species:'rimebud', station:true, risk:2, type:'station', r:700, orbit:2150000, ang:4.05, y:-38000,
    desc:'Keeps one frozen sample of everything, including a sample of the station, just in case.',
    pal:{a:'#e8f6ff',b:'#9fd6f0',c:'#3f7fa8',d:'#ffffff',atm:'#bfeaff'}, light:'#bff4ff', tanks:true,
    surf:{zen:'#02050c',hor:'#1a2a40',g:['#56626e','#7a8794','#b8c6d2'],amp:0,fog:0.00010,liquid:null,style:'station',deck:true,planet:'#3f9fc6'} },
  { name:'Calibration Spire', port:'Tolerance Station', species:'gaugekin', station:true, risk:3, type:'station', r:620, orbit:2700000, ang:5.9, y:55000,
    desc:'Measures the universe to within a whisker. The whisker is also measured, and found wanting.',
    pal:{a:'#ffe08a',b:'#c9a03a',c:'#5a4a2a',d:'#fff6d8',atm:'#ffd27a'}, light:'#ffd27a', spire:true,
    surf:{zen:'#030308',hor:'#22202e',g:['#4e4a44','#706a60','#a8a090'],amp:0,fog:0.00008,liquid:null,style:'station',deck:true,planet:'#c96a3a'} },
  { name:'Beacon Far Wink', port:'The Last Light', species:'winkmast', station:true, risk:3, type:'station', r:600, orbit:3200000, ang:2.45, y:-60000,
    desc:'The furthest lighthouse in the system. It blinks at nothing, faithfully, and files a report on every blink.',
    pal:{a:'#ffb0a0',b:'#e05a4a',c:'#5a2a2a',d:'#fff0e8',atm:'#ff9a7a'}, light:'#ff8a6a', beacon:true,
    surf:{zen:'#040206',hor:'#2a1820',g:['#4c4648','#6e6668','#a89ea0'],amp:0,fog:0.00008,liquid:null,style:'station',deck:true,planet:'#5a8ac8'} },
];
const SUN_R = 22000;
const LS = 300000;

/* how dangerous a stretch of space is. Inside FRONTIER_R the patrols keep things quiet; past DEEP_R nobody patrols at
   all, and past EXTREME_R even the pirates are nervous. Riskier routes pay more, and the job board says by how much. */
const FRONTIER_R = 1000000, DEEP_R = 1450000, EXTREME_R = 2500000;
const RISK = [
  {name:'Low', mul:1.0, col:'#7dffa8', note:'Patrolled space.'},
  {name:'Medium', mul:1.2, col:'#ffd166', note:'The edge of patrolled space. Pirates are rarer than rumours, but not much.'},
  {name:'High', mul:1.5, col:'#ff9a4a', note:'Unpatrolled deep space: pirates, meteor storms, and a long way from a tow.'},
  {name:'Extreme', mul:1.9, col:'#ff5a5a', note:'The far dark. Everything in deep space, more often and with worse manners.'},
];
const zoneAt = r => r>=EXTREME_R?3:r>=DEEP_R?2:r>=FRONTIER_R?1:0;
for(const P of PLANETS) if(P.risk==null) P.risk=zoneAt(P.orbit);
const routeRisk = (A,B) => Math.max(A?A.risk:0, B?B.risk:0);
