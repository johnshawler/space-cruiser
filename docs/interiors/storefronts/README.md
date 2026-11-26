# Long Haul storefront proof sheets

The venue proof sheet shows sixteen proposed shop exteriors across nine planets and four research stations. Each caption gives the business name, shop type and location. The [venue definitions](../../../src/08b-venues.js) supply the names, locations, services and shop keys. The facades are original concept art.

## Venue proof sheet

![Sixteen Long Haul venue exteriors in four rows. The table below follows the same reading order.](long-haul-storefronts.png)

## Guide for Claude

Use the venue sheet as the exterior design reference. Match a panel by location and shop key when working on a port. The silhouette and the equipment at the entrance are what distinguish two shops with the same function. For example, Sloshwell displays its ship in a bowl-shaped drydock, while Jovexa displays one on an open platform floating above the clouds.

The delivery consists of two full-resolution PNG proof sheets. The game’s existing rooms, counters, keepers, ship displays and interactions have separate implementation files. Any future facade model can be fitted around those features. The [port-interior handoff](../../handoff-bespoke-interiors.md) documents the anchors for depots, garages and cantinas.

| Panel | Business | Location | Shop type and key | Visible design feature |
| --- | --- | --- | --- | --- |
| 1.1 | Dispatch Bay B4 | Verdanthia | Cargo depot (`depot`) | Glazed potting shed with a dispatch clock and a vending-machine contract slot. |
| 1.2 | Form 27-B Cargo Office | Dunemoor | Cargo depot (`depot`) | Canyon-cut civic office with queue rails and a freight shutter marked 27-B. |
| 1.3 | Cold Storage Intake | Cryo Vault Rimeholm | Cargo depot (`depot`) | Frosted pressure lock with a specimen trolley on the loading apron. |
| 1.4 | Big Bowl Boatworks | Sloshwell | Shipyard (`yard`) | Split enamel bowl drydock with a ladle hoist over the display ship. |
| 2.1 | Current Affairs Shipwrights | Jovexa | Shipyard (`yard`) | Swept showroom ribs and brass pontoons above the cloud line. |
| 2.2 | Lava Lube & Patch | Scorchmaw | Garage (`garage`) | Overlapping ceramic heat shields cover an engine jack and a welder’s mitts. |
| 2.3 | Spore & Bolt | Toxibloom | Garage (`garage`) | Bracket fungi shelter an engine hoist and a rack of hull plates. |
| 2.4 | Soft Landing Repairs | Listening Post Hush | Garage (`garage`) | Acoustic wedges frame a dented hull plate on a measuring jig. |
| 3.1 | Department of Approved Colours | Dunemoor | Paint shop (`livery`) | A civic spray booth displays regulation paint swatches like official notices. |
| 3.2 | Plumage Paint & Polish | Amethyne | Paint shop (`livery`) | Feather-shaped painted panels fan out over a partly painted cowling. |
| 3.3 | Nothing To See Here Supplies | Candara | Outfitter (`outfit`) | An ordinary counter on pink pontoons conceals a false-floor compartment at the threshold. |
| 3.4 | Fine Margins Outfitters | Calibration Spire | Outfitter (`outfit`) | A ship-fitting showroom pairs a mining head with precision scales. |
| 4.1 | Gneiss Assay & Smelt | Scorchmaw | Assay office (`assay`) | A basalt arch frames a working furnace and the public ore scale. |
| 4.2 | Far Field Assay | Beacon Far Wink | Assay office (`assay`) | A pressure-hull kiosk displays rare ore beside a hanging weigh pan. |
| 4.3 | The Warm Mitten | Brrrindle | Cantina (`bar`) | A cocoa counter glows through a snow-covered bow window beside the knitted entry curtain. |
| 4.4 | The Indoor Voice | Listening Post Hush | Cantina (`bar`) | A quilted pressure vestibule opens onto padded booths and shaded lamps. |

## Original style study

[Open the first exploratory sheet](original-storefront-study.png). Its sixteen invented businesses established the miniature scale, weathered materials, practical lighting and label treatment used in the venue sheet. Use the venue sheet above for the in-game business lineup.
