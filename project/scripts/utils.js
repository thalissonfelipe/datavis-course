function isType(o, t) {
    return (typeof o).indexOf(t.charAt(0).toLowerCase()) === 0;
}

function $(id) {
    return !id || id.nodeType === 1 ? id : document.getElementById(id);
}

function image(src, cfg) {
    let img, prop, target;
    cfg = cfg || (isType(src, 'o') ? src : {});

    img = $(src);
    if (img) {
        src = cfg.src || img.src;
    } else {
        img = document.createElement('img');
        src = src || cfg.src;
    }

    if (!src) {
        return null;
    }

    prop = isType(img.naturalWidth, 'u') ? 'width' : 'naturalWidth';
    img.alt = cfg.alt || img.alt;

    // Add the image and insert if requested (must be on DOM to load or
    // pull from cache)
    img.src = src;

    target = $(cfg.target);
    if (target) {
        target.insertBefore(img, $(cfg.insertBefore) || null);
    }

    // Loaded?
    if (img.complete) {
        if (img[prop]) {
            if (isType(cfg.success, 'f')) {
                cfg.success.call(img);
            }
        } else {
            if (isType(cfg.failure, 'f')) {
                cfg.failure.call(img);
            }
        }
    } else {
        if (isType(cfg.success, 'f')) {
            img.onload = cfg.success;
        }
        if (isType(cfg.failure, 'f')) {
            img.onerror = cfg.failure;
        }
    }

    return img;
}

function checkFace(url, id) {
    image(url, {
        success: () => {
            d3.selectAll('#' + id).attr('href', url);
        },
        failure: () => {
            d3.selectAll('#' + id).attr('href', 'https://www.fifaindex.com/static/FIFA21/images/players/10/notfound.webp');
        }
    });
}

async function fetchData() {
    const dataset = await d3.csv('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/FIFA21_official_data.csv');
    let flagMap = new Map();
    let faceMap = new Map();
    let overallMap = new Map();
    dataset.forEach(d => {
        let id = flagID.get(d.Nationality);
        flagMap.set(d.Nationality, 'https://media.contentapi.ea.com/content/dam/ea/fifa/fifa-21/ratings-collective/f20assets/country-flags/'+ id +'.png');
        faceMap.set(d.ID, 'https://www.fifaindex.com/static/FIFA21/images/players/10/'+ d.ID +'.webp');
        if (overallMap.get(d.Nationality) >= d.Overall) {
            // do nothing
        } else {
            overallMap.set(d.Nationality, +d.Overall);
        }
        if (rename.get(d.Nationality)) {
            overallMap.set(rename.get(d.Nationality), overallMap.get(d.Nationality));
        }
    });
    overallMap.set("United States of America", overallMap.get("United States"));
    overallMap.set("United Kingdom", Math.max(
        overallMap.get("Wales"),
        overallMap.get("England"),
        overallMap.get("Scotland"),
        overallMap.get("Northern Ireland")
    ));

    return { dataset, flagMap, faceMap, overallMap };
}

function fetchGraph() {
    return d3.json('https://raw.githubusercontent.com/icarodelay/projeto-datavis-fifa/main/club_transfers_data_over_74.json');
}

function loadPlayer(p) {
    // flag mask
    p.svg.append('clipPath')
        .attr('id', `clipCircle${p.id}`)
        .append('circle')
            .attr('r', p.radius)
            .attr('cx', p.cx)
            .attr('cy', p.cy);

    // border flag
    p.svg.append('circle')
        .attr('r', p.radius + 2)
        .attr('cx', p.cx)
        .attr('cy', p.cy)
        .attr('fill', '#FFFFFF');

    // flag
    p.svg.append('image')
        .attr('href', p.flagMap.get(p.player.Nationality))
        .attr('x', p.flagx)
        .attr('y', p.flagy)
        .attr('height', p.flagSize)
        .attr('width', p.flagSize)
        .attr('clip-path', `url(#clipCircle${p.id})`);

    // player face
    p.svg.append('image')
        .attr('id', `${p.id}-face`)
        .attr('href', p.faceMap.get(p.player.ID))
        .attr('x', p.playerx)
        .attr('y', p.playery)
        .attr('height', p.jSize)
        .attr('width', p.jSize)
        .attr('onerror', checkFace(p.faceMap.get(p.player.ID), `${p.id}-face`))

    // Overall bg
    p.svg.append('text')
        .attr('x', p.bgx)
        .attr('y', p.bgy)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '20px')
        .attr('font-weight', 700)
        .attr('fill', '#FFFFFF')
        .attr('stroke', '#1D915B')
        .attr('stroke-width', '5px')
        .attr('textLength', 22)
        .text(p.player.Overall)

    // Overall fg
    p.svg.append('text')
        .attr('x', p.fgx)
        .attr('y', p.fgy)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '20px')
        .attr('font-weight', 700)
        .attr('fill', '#FFFFFF')
        .attr('textLength', 22)
        .text(p.player.Overall)

    // Overall tag
    p.svg.append('text')
        .attr('x', p.tagx)
        .attr('y', p.tagy)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', 200)
        .attr('fill', '#FFFFFF')
        .attr('textLength', 21.5)
        .text('OVR')

    // Card name
    p.svg.append('rect')
        .attr('x', p.cardx)
        .attr('y', p.cardy)
        .attr('width', 70)
        .attr('height', 20)
        .attr('fill', '#FFFFFF')

    // Player Name
    p.svg.append('text')
        .attr('x', p.playernamex)
        .attr('y', p.playernamey)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '12px')
        .attr('textLength', 64)
        .attr('fill', '#F05857')
        .text(p.player.Name.substr(0,14))

    // Position Pill
    p.svg.append('rect')
        .attr('x', p.pillx)
        .attr('y', p.pilly)
        .attr('width', 20)
        .attr('height', 10)
        .attr('fill', '#EB4131')
        .attr('rx', 2)

    // Position Label
    p.svg.append('text')
        .attr('x', p.labelx)
        .attr('y', p.labely)
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', 700)
        .attr('textLength', 18)
        .attr('fill', '#FFF')
        .text('ATA')
}

function bilink(root) {
    const map = new Map(root.leaves().map(d => [d.data.club, d]));
    for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.targets.map(i => [d, map.get(i)]);
    for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
    return root;
}

function createMapInstance() {
    const southWest = L.latLng(-90, -180);
    const northEast = L.latLng(90, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    const mapInstance = L.map('mapid', { maxBounds: bounds }).setView([0, 0], 2);

    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {       
        maxZoom: 12,
        minZoom: 2,            
    }).addTo(mapInstance);

    return mapInstance;
}

function createInfoControl(map, nationalityBestPlayer) {
    let infoControl = L.control();

	infoControl.onAdd = () => {
		this._div = L.DomUtil.create('div', 'info');
		infoControl.update();
		return this._div;
	}

	infoControl.update = feat => {
        // console.log(feat && nationalityBestPlayer.get(feat.properties.name))
        this._div.innerHTML = '<h5>Melhor Overall</h5>' +
        (feat ?
            '<b>' + feat.properties.name + '</b><br/>' +
            '<img src="' + faceMap.get(nationalityBestPlayer.get(feat.properties.name)[1]) +
            '" width="50px"/><b style="font-size: 20px">' + overallMap.get(feat.properties.name) +
            '</b><br/><i>' + nationalityBestPlayer.get(feat.properties.name)[0] + '</i>'
        : 'Passe o mouse sobre um país');
	}

	infoControl.addTo(map);

    return infoControl;
}

function updateFilters(e){
  seriesDim = seriesDim.filter(d => d['Nationality'] == e.properties.name);
  loadField(e.properties.name);
  dc.redrawAll();
}

function getGeoJSON(map, info, countries, style) {
    function highlightFeature(e) {
        let layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#AAA',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }

        info.update(layer.feature);
    }

    let geoj;

    function resetHighlight(e) {
        geoj.resetStyle(e.target);
        info.update();
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
        updateFilters(e.target.feature);
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature,
        });
    }

    geoj = L.geoJson(countries, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    return geoj;
}

function loadField(country) {
    // field size
    console.log(country)
    console.log(seriesDim)
    const width = 360;
    const height = 480;

    playersraw = seriesDim.top(Infinity);
    // const playersraw = seriesDim.top(Infinity);
    // const players = playersraw.filter(d => d['Nationality'] == country);
    players = playersraw.filter(d => d['Nationality'] == country);
    console.log(players.length)

    // players
    const LWTopPlayer = players.filter(d => d['Best Position'] == 'LW')[0];
    const STTopPlayer = players.filter(d => d['Best Position'] == 'ST')[0];
    const RWTopPlayer = players.filter(d => d['Best Position'] == 'RW')[0];
    const CAMTopPlayer = players.filter(d => d['Best Position'] == 'CAM')[0];
    const LMTopPlayer = players.filter(d => d['Best Position'] == 'CDM')[0];
    const RMTopPlayer = players.filter(d => d['Best Position'] == 'CM')[0];
    const LBTopPlayer = players.filter(d => d['Best Position'] == 'LB')[0];
    const RBTopPlayer = players.filter(d => d['Best Position'] == 'RB')[0];
    const RCBTopPlayer = players.filter(d => d['Best Position'] == 'CB')[1];
    const LCBTopPlayer = players.filter(d => d['Best Position'] == 'CB')[0];
    const GKTopPlayer = players.filter(d => d['Best Position'] == 'GK')[0];

    const svg = d3.select('#field').select('svg') ;
    svg.selectAll('*').remove();

    // field
    svg.append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#1D915B');

    // bottom and side lines
    svg.append('rect')
        .attr('x', '2')
        .attr('y', '2')
        .attr('width', width - 4)
        .attr('height', height - 4)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF');

    // middle lines
    svg.append('line')
        .attr('x1', 2)
        .attr('y1', height/2)
        .attr('x2', width - 2)
        .attr('y2', height/2)
        .attr('stroke', '#FFFFFF');

    // large area 1
    svg.append('rect')
        .attr('x', 80)
        .attr('y', height - 66)
        .attr('width', 200)
        .attr('height', height - 2)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF');

    // large area 2
    svg.append('rect')
        .attr('x', 80)
        .attr('y', 2)
        .attr('width', 200)
        .attr('height', 66)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF');

    // small area 1
    svg.append('rect')
        .attr('x', (width - 72)/2 )
        .attr('y', height - 24)
        .attr('width', 72)
        .attr('height', height - 2)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF');

    // small area 2
    svg.append('rect')
        .attr('x', (width - 72)/2 )
        .attr('y', 2)
        .attr('width', 72)
        .attr('height', 22)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF');

    // central circle
    svg.append('circle')
        .attr('cx', width/2)
        .attr('cy', height/2)
        .attr('r', 36)
        .attr('fill', 'none')
        .attr('stroke', '#FFFFFF');

    // middle circles and penalty mark
    svg.append('circle')
        .attr('cx', width/2)
        .attr('cy',height/2)
        .attr('r', 2)
        .attr('fill', '#FFFFFF');

    svg.append('circle')
        .attr('cx', width/2)
        .attr('cy', height - 44)
        .attr('r', 2)
        .attr('fill', '#FFFFFF');

    svg.append('circle')
        .attr('cx', width/2)
        .attr('cy', 44)
        .attr('r', 2)
        .attr('fill', '#FFFFFF');

    const radius = 10;
    const flagSize = 40;
    const jSize = 50;
    let player;

    // --------------------------- LW player --------------------------- //

    player = { svg,
        flagMap,
        faceMap,
        player: LWTopPlayer,
        flagSize,
        radius,
        jSize,
        id: 'LW',
        cx: 50,
        cy: 80,
        flagx: 30,
        flagy: 60,
        playerx: 50,
        playery: 60,
        bgx: 90,
        bgy: 70,
        fgx: 90,
        fgy: 70,
        tagx: 90,
        tagy: 50,
        cardx: 40,
        cardy: 100,
        playernamex: 43,
        playernamey: 115,
        pillx: 65,
        pilly: 40,
        labelx: 66,
        labely: 48
    }
    // console.log(player)

    loadPlayer(player);

    {
    // // flag mask
    // svg.append('clipPath')
    //     .attr('id', 'clipCircleLW')
    //     .append('circle')
    //         .attr('r', radius)
    //         .attr('cx', 50)
    //         .attr('cy', 80);

    // // border flag
    // svg.append('circle')
    //     .attr('r', radius + 2)
    //     .attr('cx', 50)
    //     .attr('cy', 80)
    //     .attr('fill', '#FFFFFF');

    // // flag
    // svg.append('image')
    //     .attr('href', flagMap.get(LWTopPlayer.Nationality))
    //     .attr('x', 30)
    //     .attr('y', 60)
    //     .attr('height', flagSize)
    //     .attr('width', flagSize)
    //     .attr('clip-path', 'url(#clipCircleLW)');

    // // player face
    // svg.append('image')
    //     .attr('id', 'LW-face')
    //     .attr('href', faceMap.get(LWTopPlayer.ID))
    //     .attr('x', 50)
    //     .attr('y', 50)
    //     .attr('height', jSize)
    //     .attr('width', jSize)
    //     .attr('onerror', checkFace(faceMap.get(LWTopPlayer.ID), 'LW-face'))

    // // Overall bg
    // svg.append('text')
    //     .attr('x', 90)
    //     .attr('y', 70)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '20px')
    //     .attr('font-weight', 700)
    //     .attr('fill', '#FFFFFF')
    //     .attr('stroke', '#1D915B')
    //     .attr('stroke-width', '5px')
    //     .attr('textLength', 22)
    //     .text(LWTopPlayer.Overall)

    // // Overall fg
    // svg.append('text')
    //     .attr('x', 90)
    //     .attr('y', 70)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '20px')
    //     .attr('font-weight', 700)
    //     .attr('fill', '#FFFFFF')
    //     .attr('textLength', 22)
    //     .text(LWTopPlayer.Overall)

    // // Overall tag
    // svg.append('text')
    //     .attr('x', 90)
    //     .attr('y', 50)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '10px')
    //     .attr('font-weight', 200)
    //     .attr('fill', '#FFFFFF')
    //     .attr('textLength', 21.5)
    //     .text('OVR')

    // // Card name
    // svg.append('rect')
    //     .attr('x', 40 )
    //     .attr('y', 100)
    //     .attr('width', 70)
    //     .attr('height', 20)
    //     .attr('fill', '#FFFFFF')

    // // Player Name
    // svg.append('text')
    //     .attr('x', 43)
    //     .attr('y', 115)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '12px')
    //     .attr('textLength', 64)
    //     .attr('fill', '#F05857')
    //     .text(LWTopPlayer.Name.substr(0,14))

    // // Position Pill
    // svg.append('rect')
    //     .attr('x', 65 )
    //     .attr('y', 40)
    //     .attr('width', 20)
    //     .attr('height', 10)
    //     .attr('fill', '#EB4131')
    //     .attr('rx', 2)

    // // Position Label
    // svg.append('text')
    //     .attr('x', 66)
    //     .attr('y', 48)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '10px')
    //     .attr('font-weight', 700)
    //     .attr('textLength', 18)
    //     .attr('fill', '#FFF')
    //     .text('ATA')
    }

    // --------------------------- ST player --------------------------- //

    player = {
        svg,
        flagMap,
        faceMap,
        player: STTopPlayer,
        flagSize,
        radius,
        jSize,
        id: 'ST',
        cx: 155,
        cy: 80,
        flagx: 135,
        flagy: 60,
        playerx: 155,
        playery: 50,
        bgx: 195,
        bgy: 70,
        fgx: 195,
        fgy: 70,
        tagx: 195,
        tagy: 50,
        cardx: 145,
        cardy: 100,
        playernamex: 148,
        playernamey: 115,
        pillx: 170,
        pilly: 40,
        labelx: 171,
        labely: 48
    }

    loadPlayer(player);

    {
    // svg.append('clipPath')
    //     .attr('id', 'clipCircleST')
    //     .append('circle')
    //         .attr('r', radius)
    //         .attr('cx', 155)
    //         .attr('cy', 80);

    // svg.append('circle')
    //     .attr('r', 12)
    //     .attr('cx', 155)
    //     .attr('cy', 80)
    //     .attr('fill', '#FFF');

    // svg.append('image')
    //     .attr('href', flagMap.get(STTopPlayer.Nationality))
    //     .attr('x', 135)
    //     .attr('y', 60)
    //     .attr('height', 40)
    //     .attr('width', 40)
    //     .attr('clip-path', 'url(#clipCircleST)')

    // svg.append('image')
    //     .attr('id', 'ST-face')
    //     .attr('href', faceMap.get(STTopPlayer.ID))
    //     .attr('x', 155)
    //     .attr('y', 50)
    //     .attr('height', 50)
    //     .attr('width', 50)
    //     .attr('onerror', checkFace(faceMap.get(STTopPlayer.ID), 'ST-face'))

    // // Overall bg
    // svg.append('text')
    //     .attr('x', 195)
    //     .attr('y', 70)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '20px')
    //     .attr('font-weight', 700)
    //     .attr('fill', '#FFFFFF')
    //     .attr('stroke', '#1D915B')
    //     .attr('stroke-width', '5px')
    //     .attr('textLength', 22)
    //     .text(STTopPlayer.Overall)

    // // Overall fg
    // svg.append('text')
    //     .attr('x', 195)
    //     .attr('y', 70)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '20px')
    //     .attr('font-weight', 700)
    //     .attr('fill', '#FFFFFF')
    //     .attr('textLength', 22)
    //     .text(STTopPlayer.Overall)

    // // Overall tag
    // svg.append('text')
    //     .attr('x', 195)
    //     .attr('y', 50)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '10px')
    //     .attr('font-weight', 200)
    //     .attr('fill', '#FFFFFF')
    //     .attr('textLength', 21.5)
    //     .text('OVR')

    // //Position Pill
    // svg.append('rect')
    //     .attr('x', 170)
    //     .attr('y', 40)
    //     .attr('width', 20)
    //     .attr('height', 10)
    //     .attr('fill', '#EB4131')
    //     .attr('rx', 2)

    // //Position Label
    // svg.append('text')
    //     .attr('x', 171)
    //     .attr('y', 48)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '10px')
    //     .attr('font-weight', 700)
    //     .attr('textLength', 18)
    //     .attr('fill', '#FFF')
    //     .text('ATA')

    // // Card Name
    // svg.append('rect')
    //     .attr('x', 145)
    //     .attr('y', 100)
    //     .attr('width', 70)
    //     .attr('height', 20)
    //     .attr('fill', '#FFFFFF')

    // svg.append('text')
    //     .attr('x', 148)
    //     .attr('y', 115)
    //     .attr('font-family', 'sans-serif')
    //     .attr('font-size', '12px')
    //     .attr('textLength', 64)
    //     .attr('fill', '#F05857')
    //     .text(STTopPlayer.Name.substr(0,14))
    }

    //JOGADOR RW ========================================================================================//
    svg.append('clipPath')
    .attr('id', 'clipCircleRW')
    .append('circle')
    .attr('r', radius)
    .attr('cx', width - 100)
    .attr('cy', 80);

    //border flag
    svg.append('circle')
    .attr('r', radius + 2)
    .attr('cx', width - 100)
    .attr('cy', 80)
    .attr('fill', '#FFF');
    //flag
    svg.append('image')
    .attr('href', flagMap.get(RWTopPlayer.Nationality))
    .attr('x', width - 120)
    .attr('y', 60)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleRW)');

    svg.append('image')
    .attr('id', 'RW-face')
    .attr('href', faceMap.get(RWTopPlayer.ID))
    .attr('x', width - 100)
    .attr('y', 50)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(RWTopPlayer.ID), 'RW-face'))

    //Overall bg
    svg.append('text')
    .attr('x', width - 60)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(STTopPlayer.Overall)

    //Overall fg
    svg.append('text')
    .attr('x', width - 60)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(RWTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', width - 60)
  .attr('y', 50)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', width - 85)
  .attr('y', 40)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#EB4131')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', width - 84)
  .attr('y', 48)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('ATA')

svg.append('rect')
  .attr('x', width - 110 )
  .attr('y', 100)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', width -107)
  .attr('y', 115)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#F05857')
  .text(RWTopPlayer.Name.substr(0,14))

//JOGADOR CAM ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleCAM')
.append('circle')
.attr('r', radius)
.attr('cx', 155)
.attr('cy', 180);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', 155)
  .attr('cy', 180)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(CAMTopPlayer.Nationality))
  .attr('x', 135)
  .attr('y', 160)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleCAM)');

svg.append('image')
  .attr('id', 'CAM-face')
  .attr('href', faceMap.get(CAMTopPlayer.ID))
  .attr('x', 155)
  .attr('y', 150)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror',checkFace(faceMap.get(CAMTopPlayer.ID),'CAM-face'))

//Overall bg
svg.append('text')
  .attr('x', 195)
  .attr('y', 170)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(CAMTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', 195)
  .attr('y', 170)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(CAMTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', 195)
  .attr('y', 150)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', 170)
  .attr('y', 140)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#3C4CBA')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', 171)
  .attr('y', 148)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('MEI')

svg.append('rect')
  .attr('x', 145)
  .attr('y', 200)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', 148)
  .attr('y', 215)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#4E80F5')
  .text(CAMTopPlayer.Name.substr(0,14))

//JOGADOR LCM ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleLM')
.append('circle')
.attr('r', radius)
.attr('cx', 75)
.attr('cy', 240);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', 75)
  .attr('cy', 240)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(LMTopPlayer.Nationality))
  .attr('x', 55)
  .attr('y', 220)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleLM)');

svg.append('image')
  .attr('id', 'LM-face')
  .attr('href', faceMap.get(LMTopPlayer.ID))
  .attr('x', 75)
  .attr('y', 210)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror', checkFace(faceMap.get(LMTopPlayer.ID),'LM-face'))

//Overall bg
svg.append('text')
  .attr('x', 115)
  .attr('y', 230)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(LMTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', 115)
  .attr('y', 230)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(LMTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', 115)
  .attr('y', 210)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', 90)
  .attr('y', 200)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#3C4CBA')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', 91)
  .attr('y', 208)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('MEI')

svg.append('rect')
  .attr('x', 145 - 80)
  .attr('y', 260)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', 148 - 80)
  .attr('y', 275)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#4E80F5')
  .text(LMTopPlayer.Name.substr(0,14))

//JOGADOR RCM  ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleRM')
.append('circle')
.attr('r', radius)
.attr('cx', 235)
.attr('cy', 240);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', 235)
  .attr('cy', 240)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(RMTopPlayer.Nationality))
  .attr('x', 215)
  .attr('y', 220)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleRM)');

svg.append('image')
  .attr('id', 'RM-face')
  .attr('href', faceMap.get(RMTopPlayer.ID))
  .attr('x', 235)
  .attr('y', 210)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror', checkFace(faceMap.get(RMTopPlayer.ID),'RM-face'))

//Overall bg
svg.append('text')
  .attr('x', 275)
  .attr('y', 230)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(RMTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', 275)
  .attr('y', 230)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(RMTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', 275)
  .attr('y', 210)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', 250)
  .attr('y', 200)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#3C4CBA')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', 251)
  .attr('y', 208)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('MEI')

svg.append('rect')
  .attr('x', 145 + 80)
  .attr('y', 260)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', 148 + 80)
  .attr('y', 275)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#4E80F5')
  .text(RMTopPlayer.Name.substr(0,14))

//JOGADOR LB ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleLB')
.append('circle')
.attr('r', radius)
.attr('cx', 20)
.attr('cy', 330);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', 20)
  .attr('cy', 330)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(LBTopPlayer.Nationality))
  .attr('x', 0)
  .attr('y', 310)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleLB)');

svg.append('image')
  .attr('id', 'LB-face')
  .attr('href', faceMap.get(LBTopPlayer.ID))
  .attr('x', 20)
  .attr('y', 300)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror', checkFace(faceMap.get(LBTopPlayer.ID),'LB-face'))

//Overall bg
svg.append('text')
  .attr('x', 60)
  .attr('y', 320)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(LBTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', 60)
  .attr('y', 320)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(LBTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', 60)
  .attr('y', 300)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', 35)
  .attr('y', 290)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#E69225')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', 36)
  .attr('y', 298)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('LAT')

svg.append('rect')
  .attr('x', 40 - 30)
  .attr('y', 350)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', 43 - 30)
  .attr('y', 365)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#E6C512')
  .text(LBTopPlayer.Name.substr(0,14))

//JOGADOR RB  ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleRB')
.append('circle')
.attr('r', radius)
.attr('cx', width - 70)
.attr('cy', 330);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', width - 70)
  .attr('cy', 330)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(RBTopPlayer.Nationality))
  .attr('x', width - 90)
  .attr('y', 310)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleRB)');

svg.append('image')
  .attr('id', 'RB-face')
  .attr('href', faceMap.get(RBTopPlayer.ID))
  .attr('x', width - 70)
  .attr('y', 300)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror', checkFace(faceMap.get(RBTopPlayer.ID),'RB-face'))

//Overall bg
svg.append('text')
  .attr('x', width - 30)
  .attr('y', 320)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(RBTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', width - 30)
  .attr('y', 320)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(RBTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', width - 30)
  .attr('y', 300)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', width - 55)
  .attr('y', 290)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#E69225')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', width - 54)
  .attr('y', 298)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('LAT')

svg.append('rect')
  .attr('x', width - 110 + 30)
  .attr('y', 350)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', width -107 +30)
  .attr('y', 365)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#E6C512')
  .text(RBTopPlayer.Name.substr(0,14))

//JOGADOR RCB  ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleRCB')
.append('circle')
.attr('r', radius)
.attr('cx', 100)
.attr('cy', 360);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', 100)
  .attr('cy', 360)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(RCBTopPlayer.Nationality))
  .attr('x', 80)
  .attr('y', 340)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleRCB)');

svg.append('image')
  .attr('id', 'RCB-face')
  .attr('href', faceMap.get(RCBTopPlayer.ID))
  .attr('x', 100)
  .attr('y', 330)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror', checkFace(faceMap.get(RCBTopPlayer.ID),'RCB-face'))

//Overall bg
svg.append('text')
  .attr('x', 140)
  .attr('y', 350)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(RCBTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', 140)
  .attr('y', 350)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(RCBTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', 140)
  .attr('y', 330)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', 115)
  .attr('y', 320)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#E69225')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', 116)
  .attr('y', 328)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('ZAG')

svg.append('rect')
  .attr('x', 40 + 50)
  .attr('y', 380)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', 43 + 50)
  .attr('y', 395)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#E6C512')
  .text(RCBTopPlayer.Name.substr(0,14))

//JOGADOR LCB ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleLCB')
.append('circle')
.attr('r', radius)
.attr('cx', width - 150)
.attr('cy', 360);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', width - 150)
  .attr('cy', 360)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(LCBTopPlayer.Nationality))
  .attr('x', width - 170)
  .attr('y', 340)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleLCB)');

svg.append('image')
  .attr('id', 'LCB-face')
  .attr('href', faceMap.get(LCBTopPlayer.ID))
  .attr('x', width - 150)
  .attr('y', 330)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onerror', checkFace(faceMap.get(LCBTopPlayer.ID),'LCB-face'))

//Overall bg
svg.append('text')
  .attr('x',  width - 110)
  .attr('y', 350)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(LCBTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x',  width - 110)
  .attr('y', 350)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(LCBTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', width - 110)
  .attr('y', 330)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', width - 135)
  .attr('y', 320)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#E69225')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', width - 134)
  .attr('y', 328)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('ZAG')

svg.append('rect')
  .attr('x', width - 110 -50)
  .attr('y', 380)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', width -107 - 50)
  .attr('y', 395)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#E6C512')
  .text(LCBTopPlayer.Name.substr(0,14))

//JOGADOR GK ========================================================================================//
//flag mask
svg.append('clipPath')
.attr('id', 'clipCircleGK')
.append('circle')
.attr('r', radius)
.attr('cx', 155)
.attr('cy', height - 40);

//border flag
svg.append('circle')
  .attr('r', radius + 2)
  .attr('cx', 155)
  .attr('cy', height - 40)
  .attr('fill', '#FFF');

//flag
svg.append('image')
  .attr('href', flagMap.get(GKTopPlayer.Nationality))
  .attr('x', 135)
  .attr('y', height - 60)
  .attr('height', flagSize)
  .attr('width', flagSize)
  .attr('clip-path', 'url(#clipCircleGK)');

// svg.append('image')
//     .attr('href', flagMap.get(GKTopPlayer.Nationality))
//     .attr('x', 145)
//     .attr('y', height - 50)
//     .attr('height', 20)
//     .attr('width', 20)

svg.append('image')
  .attr('id', 'GK-face')
  .attr('href', faceMap.get(GKTopPlayer.ID))
  .attr('x', width/2 - 25)
  .attr('y', height - 70)
  .attr('height', 50)
  .attr('width', 50)
  .attr('onError', checkFace(faceMap.get(GKTopPlayer.ID),'GK-face'))

//Overall bg
svg.append('text')
  .attr('x', 195)
  .attr('y', height - 50)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('stroke', '#1D915B')
  .attr('stroke-width', '5px')
  .attr('textLength', 22)
  .text(GKTopPlayer.Overall)

//Overall fg
svg.append('text')
  .attr('x', 195)
  .attr('y', height - 50)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '20px')
  .attr('font-weight', 700)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 22)
  .text(GKTopPlayer.Overall)

//Overall tag
svg.append('text')
  .attr('x', 195)
  .attr('y', height - 70)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 200)
  .attr('fill', '#FFFFFF')
  .attr('textLength', 21.5)
  .text('OVR')

//Position Pill
svg.append('rect')
  .attr('x', 170)
  .attr('y', height - 80)
  .attr('width', 20)
  .attr('height', 10)
  .attr('fill', '#C739D4')
  .attr('rx', 2)

//Position Label
svg.append('text')
  .attr('x', 171)
  .attr('y', height - 72)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '10px')
  .attr('font-weight', 700)
  .attr('textLength', 18)
  .attr('fill', '#FFF')
  .text('GOL')

svg.append('rect')
  .attr('x', 145)
  .attr('y', height - 22)
  .attr('width', 70)
  .attr('height', 20)
  .attr('fill', '#FFFFFF')

svg.append('text')
  .attr('x', 148)
  .attr('y', height - 8)
  .attr('font-family', 'sans-serif')
  .attr('font-size', '12px')
  .attr('textLength', 64)
  .attr('fill', '#FF8BE0')
  .text(GKTopPlayer.Name.substr(0,14))
}