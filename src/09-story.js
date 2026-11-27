/* ===================== STORIES ===================== */
/* Every job has a sender, a recipient and a reason. You read the reason when you pick the job up, and you get the
   ending when you hand it over. Each entry is a pair: [what you are told at pick-up, what happens at delivery].
   {from} is the sender, {to} the recipient, {planet} and {port} the destination. */
const STORY_GOODS = {
  'Self-Heating Soup Bricks':["{from} promised {to} a hot dinner next time they visited. {to} has since moved to {planet}, so dinner is going to them.","{to} opens a brick. It heats up. It sets off the fire alarm. \"Just like home,\" they say, damply."],
  'Pre-Owned Moon Dust':["{from} is clearing out an old moon and thinks {to} on {planet} might want the dust. Nobody has asked {to}.","{to} stares at the dust for a long time. \"I did not ask for this,\" they say, and sign for it anyway."],
  'Artisanal Gravity (Small Batch)':["{to} runs a small café on {planet} where the cups keep floating off. {from} hand-pours gravity in small batches. This is the cure.","{to} sprinkles a little on the nearest table. A cup sits down for the first time in years. Someone at the back starts to cry."],
  'Unlicensed Nostalgia':["{from} found a crate of other people's good old days in a cupboard. {to} on {planet} collects them. Neither of them has a licence.","{to} opens the lid a crack and sighs about a summer they never had. \"Lovely,\" they say. \"Tell nobody.\""],
  'Left-Handed Wormholes':["{to} ordered right-handed wormholes. {from} has sent left-handed ones and says nobody will notice.","{to} notices at once. They sign with their left hand, out of spite."],
  'Emotional Support Asteroids':["{to} has a big exam coming up on {planet}. {from}, their aunt, is sending moral support. It weighs four tonnes.","{to} pats the nearest asteroid. It does nothing at all, which is exactly what they needed."],
  'Dehydrated Water':["{from} runs out of things to sell every spring. This year it is water with the water taken out. {to} has bought the lot.","{to} adds water. It becomes water. \"Worth every credit,\" they say, with a face that says otherwise."],
  'Glow-in-the-Dark Shadows':["{to} is throwing a party on {planet} and wants it dark, but visibly. {from} makes the only shadows that glow.","{to} turns the lights off to test them. The shadows glow. Everyone agrees this is unsettling and wonderful."],
  'Mildly Cursed Furniture':["{from} inherited a three-piece suite with opinions. {to} on {planet} collects difficult furniture and has made space.","{to} sits on the ottoman. Nothing happens. They look at the wardrobe. The wardrobe looks back. They sign quickly."],
  'Bulk Googly Eyes':["{to} is redecorating a whole office on {planet}. {from} has sent enough googly eyes for everything in it, staff included.","{to} sticks two on the delivery note. It looks more trustworthy straight away."],
  'Fermented Starlight':["{from} has been ageing this starlight since before {to} was born. It is a wedding present. The wedding was last year.","{to} pours a glass. It is very old and very bright. They have to drink it with their eyes shut."],
  'Decaf Plasma':["{to}'s doctor on {planet} has told them to cut down. {from} is sending decaf plasma so they can still pretend.","{to} takes a sip, waits, and says \"yes, I feel nothing.\" They seem disappointed and relieved."],
  'Second-Hand Sunsets':["{from} is moving somewhere with no sky and is passing their sunsets on to {to}. They have only been watched once.","{to} unpacks one on the spot. The whole depot goes orange for a minute. Nobody talks."],
  'Quantum Socks (Unpaired)':["{to} on {planet} has lost one sock of every pair they own. {from} hopes quantum socks will help. They will not.","{to} counts the socks. Then counts them again. There are now more socks than before. They decide not to ask."],
  'Sentient Cheese (Mild)':["The cheese wants to see {planet}. {from} has given up arguing with it. {to} has agreed to show it around.","{to} opens the crate. The cheese says something rude about the flight. {to} apologises to it on your behalf."],
  'Recreational Bubble Wrap':["{to} runs a calm-down room on {planet}. {from} supplies the bubble wrap. The one rule is that nobody pops it on the way.","{to} checks every sheet. Every bubble is intact. They nod at you with deep respect."],
  'Screaming Cactus Seedlings':["{from} needs these out of the house before the neighbours complain again. {to} on {planet} has a very large, very remote garden.","{to} plants one on the spot. It screams. They smile. \"They are settling in,\" they say."],
  'Zero-G Hair Gel':["{to} is in a hairstyle contest on {planet}. {from} is their stylist and does not trust the local gel.","{to} tries some at once. Their hair goes up and stays up. It may stay up for good."],
  'Certified Pre-Chewed Gum':["{from} chews gum for a living. {to} on {planet} sells it, with a certificate. Nobody has ever asked why.","{to} checks the certificate, then the gum, then the certificate again. \"Genuine,\" they say. You did not want to know."],
  'Novelty Oversized Atoms':["{to} teaches science on {planet}. Normal atoms are too small for the back row. {from} makes them big enough to see.","{to} holds one up. The back row can finally see it. They are not impressed. Nobody is ever impressed by atoms."],
  'Bottled Uncomfortable Silence':["{to} hosts dinner parties on {planet} and they go too well. {from} bottles silence for the awkward pause every good party needs.","{to} uncorks one by accident. The whole depot goes quiet. Someone coughs. It is the worst thing you have ever heard."],
  'Antimatter Sprinkles':["{from} makes ice cream for the brave. {to} on {planet} runs the only parlour that dares to serve it.","{to} takes the tin with tongs, oven mitts and a long face. \"Thank you,\" they say. \"Please stand further away.\""],
  'Tax-Deductible Fog':["{to} has an accountant on {planet} who says fog is a business expense. {from} has sent plenty, with the receipts somewhere inside.","{to} opens a corner. Fog pours out. They will be looking for the receipts until spring."],
  'Haunted Rubber Ducks':["{from} cannot sleep with the ducks in the house. {to} on {planet} runs a bath shop and is not afraid of anything.","{to} lines the ducks up on the counter. They all turn to look at you at once. {to} says that is a good sign."],
  'Slightly Used Tomorrows':["{from} had a few tomorrows they never got round to. {to} on {planet} is always short of time and will take them.","{to} uses one straight away. You get the feeling it is later than it was. They thank you yesterday."],
  'Organic Free-Range Static':["{to} likes their static to have had a good life. {from} lets theirs roam free on a farm with plenty of carpet.","{to} opens the crate and their hair stands on end. \"Happy static,\" they say, crackling."],
};
const STORY_ANY = [
  ["{from} owes {to} a favour from a card game nobody remembers clearly. This is the favour.","{to} looks inside and says \"oh, this again.\" They seem quite pleased."],
  ["{to} ordered this from {from} a long time ago and has since forgotten why.","{to} remembers why the moment they open it, and goes slightly red."],
  ["{from} is sending this to {to} on {planet} to say sorry. It is not clear what for. It is better not to ask.","{to} reads the note inside, laughs, then stops laughing. \"Apology accepted,\" they say. \"Probably.\""],
  ["{to} is opening a shop on {planet} and {from} is the only supplier who answered. The shop opens tomorrow.","{to} unpacks straight onto the shelves. The shop opens with a minute to spare. You are its first customer, technically."],
  ["{from} lost a bet with {to}. The bet was about whether anyone would deliver this on time.","{to} checks the clock, then checks it again. Somebody, somewhere, has just won a bet."],
  ["{to} keeps a museum on {planet} of things nobody else wanted. {from} has found more.","{to} gives the crate a little label and a place on a shelf. It is the happiest that crate has ever looked."],
  ["{from} is {to}'s grandparent and sends a parcel every year, whether {to} wants one or not.","{to} opens it, sighs fondly, and puts it in the cupboard with the others. The cupboard is full."],
  ["{to} won this in a competition run by {from}. Nobody else entered.","{to} signs with a flourish. \"I knew I would win,\" they say. They are right. Nobody else entered."],
  ["{from} says {to} will know what it means. {from} does not seem to know what it means.","{to} looks at it, then at you, then at it. \"Ah,\" they say. They do not say anything else."],
  ["{to} has been waiting for this on {planet} for so long that they have started telling people it is a myth.","{to} holds it up for the whole depot to see. \"It exists!\" Nobody else was ever in doubt."],
];
/* deliveries out to the research stations: somebody very far away has been waiting a very long time */
const STORY_STATION = [
  ["{to} at {port} ordered this for an experiment. The experiment is to see whether anyone will deliver this far out.","{to} writes \"YES\" in a notebook, underlines it twice, and shakes your hand for slightly too long."],
  ["{from} is sending this to {to}, who has been at {planet} for three years and has stopped being sure that other people exist.","{to} pokes you gently to check you are real. You are. They seem relieved, and then a bit overwhelmed."],
  ["{to} asked for this in a message sent eleven months ago. {from} only just found the message behind a radiator.","{to} signs for it and says it is no longer needed, but they will keep it, because nobody ever comes out here."],
  ["The crew at {port} drew lots to decide what to order this year. {to} won. {from} thinks {to} chose badly.","{to} unwraps it in front of the whole crew, who all applaud. Some of them are also quietly disappointed."],
  ["{to} is running a very long study at {planet} on how long deliveries take. You are part of the study now.","{to} checks a stopwatch, nods, and writes down a number. They will not tell you whether it was a good number."],
  ["{from} says this is the only thing keeping morale up at {port}. {from} has not seen the morale at {port}.","{to} hugs the crate. Morale at {port} goes up by a measurable amount. Somebody measures it."],
];
const STORY_CONTRA = [
  ["{from} says the crate is full of nothing, and nothing is worth a great deal on {planet}. Do not open it. There is nothing to see.","A figure in a long coat takes the crate, says \"we were never here\", and leaves. You were definitely there."],
  ["{from} needs this on {planet} before anyone official notices it is gone. {from} will not say gone from where.","Someone whistles from behind a stack of barrels. The crate goes in, a bag of credits comes out, and nobody makes eye contact."],
  ["{to} runs a perfectly normal shop on {planet} that has no front door. {from} supplies it.","{to} opens a door that was not there a second ago, takes the crate and closes it. The door is no longer there."],
  ["{from} calls it a present for {to}. Presents do not usually come with a list of patrol times.","{to} takes the crate and counts the credits out without looking at you. \"Lovely present,\" they say. \"Never send another.\""],
];
const STORY_VIP = [
  ["They are going to {planet} to open a bridge. There is no river yet. That is the next trip.","{vip} cuts a ribbon on the landing pad by mistake. Everyone claps anyway."],
  ["They are going to {planet} to give a speech about the importance of speeches.","{vip} begins the speech on the steps. You are long gone before it ends. It may still be going."],
  ["They are going to {planet} to judge a soup contest, which is more dangerous than it sounds.","{vip} straightens their sash, takes a deep breath and walks towards the soup."],
  ["They are going to {planet} for a summit about the shape of summits.","{vip} thanks you warmly, then goes off to argue about pointy against round for three days."],
  ["They are going to {planet} to apologise on behalf of somebody much more important.","{vip} practises looking sorry all the way down the ramp. They are very good at it."],
];
const PAX_TRIPS = [
  ['visiting a cousin who owes them money',"They spot the cousin across the pad. The cousin spots them and runs. They run after the cousin. Good luck to both."],
  ['going to a wedding, possibly their own',"They check a list. It is their own wedding. They thank you, panic politely and hurry off to find a hat."],
  ['late for a very important nap',"They yawn, shake your hand and lie down right there on the pad. Nap achieved."],
  ['delivering a speech nobody asked for',"They clear their throat at the depot desk. The staff leave. They begin anyway."],
  ['attending a conference on conferences',"They pin on a badge that says HELLO, MY NAME IS ATTENDING. They look nervous and happy."],
  ['running away from a minor embarrassment',"They step off and look around. Nobody here knows what they did. They have never looked happier."],
  ['going to see a famous rock (the rock is not famous)',"They ask the way to the famous rock. Nobody has heard of it. This only makes them keener."],
  ['returning a library book that is nine years overdue',"They hold the book out at arm's length and walk towards the library like someone defusing a bomb."],
  ['moving house, one small bag at a time',"They carry one small bag down the ramp and ask when you are next going back. There are four hundred bags."],
];
const Story = {
  who(sp, seed){ return {sp,seed,name:alienName(sp,seed)}; },
  /* an ordinary crate: someone at this port sends it to someone at the far end */
  cargo(j){ const known=Career.story(j); if(known) return known;   // the port's regular, who remembers you
    const T=PLANETS[j.to], to=this.who(Math.random()<0.6?T.species:pick(ALIEN_POOL),(j.seed*7+13)%1000000007), pair=T.station&&Math.random()<0.55?pick(STORY_STATION):STORY_GOODS[j.good]&&Math.random()<0.65?STORY_GOODS[j.good]:pick(STORY_ANY);
    const o={from:alienName(j.sp,j.seed),to:to.name,planet:T.name,port:T.port}; return {pick:fill(pair[0],o),drop:fill(pair[1],o),to}; },
  contra(j){ const T=PLANETS[j.to], to=this.who(pick(['vrell','grondar','qeeble','blorpax']),(j.seed*11+5)%1000000007), pair=pick(STORY_CONTRA), o={from:alienName(j.sp,j.seed),to:to.name,planet:T.name,port:T.port};
    return {pick:fill(pair[0],o),drop:fill(pair[1],o),to:{sp:to.sp,seed:to.seed,name:to.name+' · never here'}}; },
  escort(j){ const T=PLANETS[j.to], pair=pick(STORY_VIP), o={vip:j.vip.title,planet:T.name,port:T.port}; return {pick:fill(pair[0],o),drop:fill(pair[1],o),to:{sp:j.vip.sp,seed:j.vip.seed,name:j.vip.title}}; },
  pax(j){ const pair=pick(PAX_TRIPS); return {why:pair[0],drop:pair[1],to:{sp:j.sp,seed:j.seed,name:j.good}}; },
  /* the ending for cargo that came aboard some other way: lost property, hitchhikers, old saves */
  ending(c, P){ if(c.story) return c.story;
    if(c.quest) return {drop:`${c.owner||'The owner'} holds it up to the light, checks it really is theirs, and hugs it. Then hugs you. Then looks embarrassed.`,to:{sp:P.species,seed:(c.pay||1)*31+P.idx,name:c.owner||'The owner'}};
    if(c.kind==='pax') return {drop:`They thank you, tip a hat they are not wearing and wander off into ${P.port}.`,to:{sp:c.sp,seed:c.seed,name:c.good}};
    if(c.kind==='escort') return {drop:`${c.vip.title} steps off, looks at ${P.port} and says it is smaller than in the brochure.`,to:{sp:c.vip.sp,seed:c.vip.seed,name:c.vip.title}};
    const to=this.who(P.species,(c.pay||1)*17+P.idx*3+c.qty); return {drop:`${to.name} signs for it without reading the form. The form says they now own your ship. Nobody notices.`,to}; },
};
