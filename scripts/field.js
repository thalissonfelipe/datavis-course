function loadField(country) {
  const playersraw = seriesDim.top(Infinity);
  const players = country
    ? country === 'United Kingdom'
      ? playersraw.filter(d => ['England', 'Scotland', 'Northern Ireland', 'Wales'].includes(d.Nationality))
      : playersraw.filter(d => d.Nationality === country)
    : playersraw;

  fieldSVG.selectAll('*').remove();

  // field
  fieldSVG.append('rect')
  .attr('x', '0')
  .attr('y', '0')
  .attr('width', fieldWidth)
  .attr('height', fieldHeight)
  .attr('fill', '#1D915B');

  // bottom and side lines
  fieldSVG.append('rect')
    .attr('x', '2')
    .attr('y', '2')
    .attr('width', fieldWidth - 4)
    .attr('height', fieldHeight - 4)
    .attr('fill', 'none')
    .attr('stroke', '#FFFFFF');

  // middle lines
  fieldSVG.append('line')
    .attr('x1', 2)
    .attr('y1', fieldHeight/2)
    .attr('x2', fieldWidth - 2)
    .attr('y2', fieldHeight/2)
    .attr('stroke', '#FFFFFF');

  // large area 1
  fieldSVG.append('rect')
    .attr('x', 80)
    .attr('y', fieldHeight - 66)
    .attr('width', 200)
    .attr('height', fieldHeight - 2)
    .attr('fill', 'none')
    .attr('stroke', '#FFFFFF');

  // large area 2
  fieldSVG.append('rect')
    .attr('x', 80)
    .attr('y', 2)
    .attr('width', 200)
    .attr('height', 66)
    .attr('fill', 'none')
    .attr('stroke', '#FFFFFF');

  // small area 1
  fieldSVG.append('rect')
    .attr('x', (fieldWidth - 72)/2 )
    .attr('y', fieldHeight - 24)
    .attr('width', 72)
    .attr('height', fieldHeight - 2)
    .attr('fill', 'none')
    .attr('stroke', '#FFFFFF');

  // small area 2
  fieldSVG.append('rect')
    .attr('x', (fieldWidth - 72)/2 )
    .attr('y', 2)
    .attr('width', 72)
    .attr('height', 22)
    .attr('fill', 'none')
    .attr('stroke', '#FFFFFF');

  // central circle
  fieldSVG.append('circle')
    .attr('cx', fieldWidth/2)
    .attr('cy', fieldHeight/2)
    .attr('r', 36)
    .attr('fill', 'none')
    .attr('stroke', '#FFFFFF');

  // middle circles and penalty mark
  fieldSVG.append('circle')
    .attr('cx', fieldWidth/2)
    .attr('cy',fieldHeight/2)
    .attr('r', 2)
    .attr('fill', '#FFFFFF');

  fieldSVG.append('circle')
    .attr('cx', fieldWidth/2)
    .attr('cy', fieldHeight - 44)
    .attr('r', 2)
    .attr('fill', '#FFFFFF');

  fieldSVG.append('circle')
    .attr('cx', fieldWidth/2)
    .attr('cy', 44)
    .attr('r', 2)
    .attr('fill', '#FFFFFF');

  if (players.length < 11) { // Min players: 11
    loadText();
    return;
  }

  const LWSubstitute = ['ST', 'CF', 'RW', 'CAM', 'CDM', 'CM'];
  const STSubstitute = ['CF', 'LW', 'RW', 'CAM', 'CDM', 'CM'];
  const RWSubstitute = ['ST', 'CF', 'LW', 'CAM', 'CDM', 'CM'];
  const CAMSubstitute = ['CDM', 'CM'];
  const LMSubstitute = ['CAM', 'CM'];
  const RMSubstitute = ['CAM', 'CDM'];
  const LBSubstitute = ['LWB', 'RB', 'RWB'];
  const RBSubstitute = ['RWB', 'LB', 'LWB'];

  const SUBSTITUTIONS_COUNT = {
    ST: 0,
    CF: 0,
    LW: 0,
    RW: 0,
    CAM: 0,
    CDM: 0,
    CM: 0,
    LB: 0,
    RB: 0,
    LWB: 0,
    RWB: 0
  };

  // players
  const LWTopPlayer = getPlayer(players, 'LW', LWSubstitute, SUBSTITUTIONS_COUNT);
  const STTopPlayer = getPlayer(players, 'ST', STSubstitute, SUBSTITUTIONS_COUNT);
  const RWTopPlayer = getPlayer(players, 'RW', RWSubstitute, SUBSTITUTIONS_COUNT);
  const CAMTopPlayer = getPlayer(players, 'CAM', CAMSubstitute, SUBSTITUTIONS_COUNT);
  const LMTopPlayer = getPlayer(players, 'CDM', LMSubstitute, SUBSTITUTIONS_COUNT);
  const RMTopPlayer = getPlayer(players, 'CM', RMSubstitute, SUBSTITUTIONS_COUNT);
  const LBTopPlayer = getPlayer(players, 'LB', LBSubstitute, SUBSTITUTIONS_COUNT);
  const RBTopPlayer = getPlayer(players, 'RB', RBSubstitute, SUBSTITUTIONS_COUNT);
  const LCBTopPlayer = players.filter(d => d['Best Position'] === 'CB')[0];
  const RCBTopPlayer = players.filter(d => d['Best Position'] === 'CB')[1];
  const GKTopPlayer = players.filter(d => d['Best Position'] === 'GK')[0];

  const allPlayers = [
    LWTopPlayer, STTopPlayer, RWTopPlayer, CAMTopPlayer, LMTopPlayer,
    RMTopPlayer, LBTopPlayer, RBTopPlayer, LCBTopPlayer, RCBTopPlayer, GKTopPlayer
  ];

  const hasPlayers = allPlayers.every(player => player);
  if (!hasPlayers) {
    loadText();
    return;
  }

  // --------------------------- LW player --------------------------- //

  // flag mask
  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleLW')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 50)
    .attr('cy', 80);

  // border flag
  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 50)
    .attr('cy', 80)
    .attr('fill', '#FFFFFF');

  // flag
  fieldSVG.append('image')
    .attr('href', flagMap.get(LWTopPlayer.Nationality))
    .attr('x', 30)
    .attr('y', 60)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleLW)');

  // player face
  fieldSVG.append('image')
    .attr('id', 'LW-face')
    .attr('href', faceMap.get(LWTopPlayer.ID))
    .attr('x', 50)
    .attr('y', 50)
    .attr('height', jSize)
    .attr('width', jSize)
    .attr('onerror', checkFace(faceMap.get(LWTopPlayer.ID), 'LW-face'))

  // Overall bg
  fieldSVG.append('text')
    .attr('x', 90)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(LWTopPlayer.Overall)

  // Overall fg
  fieldSVG.append('text')
    .attr('x', 90)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(LWTopPlayer.Overall)

  // Overall tag
  fieldSVG.append('text')
    .attr('x', 90)
    .attr('y', 50)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  // Card name
  fieldSVG.append('rect')
    .attr('x', 40 )
    .attr('y', 100)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  // Player Name
  fieldSVG.append('text')
    .attr('x', 43)
    .attr('y', 115)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#F05857')
    .text(LWTopPlayer.Name.substr(0,14))

  // Position Pill
  fieldSVG.append('rect')
    .attr('x', 65 )
    .attr('y', 40)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#EB4131')
    .attr('rx', 2)

  // Position Label
  fieldSVG.append('text')
    .attr('x', 66)
    .attr('y', 48)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('ATA')

  // --------------------------- ST player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleST')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 155)
    .attr('cy', 80);

  fieldSVG.append('circle')
    .attr('r', 12)
    .attr('cx', 155)
    .attr('cy', 80)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(STTopPlayer.Nationality))
    .attr('x', 135)
    .attr('y', 60)
    .attr('height', 40)
    .attr('width', 40)
    .attr('clip-path', 'url(#clipCircleST)')

  fieldSVG.append('image')
    .attr('id', 'ST-face')
    .attr('href', faceMap.get(STTopPlayer.ID))
    .attr('x', 155)
    .attr('y', 50)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(STTopPlayer.ID), 'ST-face'))

  // Overall bg
  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(STTopPlayer.Overall)

  // Overall fg
  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(STTopPlayer.Overall)

  // Overall tag
  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', 50)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  // Position Pill
  fieldSVG.append('rect')
    .attr('x', 170)
    .attr('y', 40)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#EB4131')
    .attr('rx', 2)

  // Position Label
  fieldSVG.append('text')
    .attr('x', 171)
    .attr('y', 48)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('ATA')

  // Card Name
  fieldSVG.append('rect')
    .attr('x', 145)
    .attr('y', 100)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 148)
    .attr('y', 115)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#F05857')
    .text(STTopPlayer.Name.substr(0,14))

  // --------------------------- RW player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleRW')
    .append('circle')
    .attr('r', radius)
    .attr('cx', fieldWidth - 100)
    .attr('cy', 80);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', fieldWidth - 100)
    .attr('cy', 80)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(RWTopPlayer.Nationality))
    .attr('x', fieldWidth - 120)
    .attr('y', 60)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleRW)');

  fieldSVG.append('image')
    .attr('id', 'RW-face')
    .attr('href', faceMap.get(RWTopPlayer.ID))
    .attr('x', fieldWidth - 100)
    .attr('y', 50)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(RWTopPlayer.ID), 'RW-face'))

  fieldSVG.append('text')
    .attr('x', fieldWidth - 60)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(STTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 60)
    .attr('y', 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(RWTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 60)
    .attr('y', 50)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', fieldWidth - 85)
    .attr('y', 40)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#EB4131')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 84)
    .attr('y', 48)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('ATA')

  fieldSVG.append('rect')
    .attr('x', fieldWidth - 110 )
    .attr('y', 100)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', fieldWidth -107)
    .attr('y', 115)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#F05857')
    .text(RWTopPlayer.Name.substr(0,14))

  // --------------------------- CAM player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleCAM')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 155)
    .attr('cy', 180);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 155)
    .attr('cy', 180)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(CAMTopPlayer.Nationality))
    .attr('x', 135)
    .attr('y', 160)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleCAM)');

  fieldSVG.append('image')
    .attr('id', 'CAM-face')
    .attr('href', faceMap.get(CAMTopPlayer.ID))
    .attr('x', 155)
    .attr('y', 150)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror',checkFace(faceMap.get(CAMTopPlayer.ID),'CAM-face'))

  fieldSVG.append('text')
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

  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', 170)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(CAMTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', 150)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', 170)
    .attr('y', 140)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#3C4CBA')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', 171)
    .attr('y', 148)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('MEI')

  fieldSVG.append('rect')
    .attr('x', 145)
    .attr('y', 200)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 148)
    .attr('y', 215)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#4E80F5')
    .text(CAMTopPlayer.Name.substr(0,14))

  // --------------------------- LM player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleLM')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 75)
    .attr('cy', 240);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 75)
    .attr('cy', 240)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(LMTopPlayer.Nationality))
    .attr('x', 55)
    .attr('y', 220)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleLM)');

  fieldSVG.append('image')
    .attr('id', 'LM-face')
    .attr('href', faceMap.get(LMTopPlayer.ID))
    .attr('x', 75)
    .attr('y', 210)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(LMTopPlayer.ID),'LM-face'))

  fieldSVG.append('text')
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

  fieldSVG.append('text')
    .attr('x', 115)
    .attr('y', 230)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(LMTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 115)
    .attr('y', 210)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', 90)
    .attr('y', 200)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#3C4CBA')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', 91)
    .attr('y', 208)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('MEI')

  fieldSVG.append('rect')
    .attr('x', 145 - 80)
    .attr('y', 260)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 148 - 80)
    .attr('y', 275)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#4E80F5')
    .text(LMTopPlayer.Name.substr(0,14))

  // --------------------------- RM player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleRM')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 235)
    .attr('cy', 240);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 235)
    .attr('cy', 240)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(RMTopPlayer.Nationality))
    .attr('x', 215)
    .attr('y', 220)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleRM)');

  fieldSVG.append('image')
    .attr('id', 'RM-face')
    .attr('href', faceMap.get(RMTopPlayer.ID))
    .attr('x', 235)
    .attr('y', 210)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(RMTopPlayer.ID),'RM-face'))

  fieldSVG.append('text')
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

  fieldSVG.append('text')
    .attr('x', 275)
    .attr('y', 230)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(RMTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 275)
    .attr('y', 210)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', 250)
    .attr('y', 200)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#3C4CBA')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', 251)
    .attr('y', 208)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('MEI')

  fieldSVG.append('rect')
    .attr('x', 145 + 80)
    .attr('y', 260)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 148 + 80)
    .attr('y', 275)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#4E80F5')
    .text(RMTopPlayer.Name.substr(0,14))

  // --------------------------- LB player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleLB')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 20)
    .attr('cy', 330);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 20)
    .attr('cy', 330)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(LBTopPlayer.Nationality))
    .attr('x', 0)
    .attr('y', 310)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleLB)');

  fieldSVG.append('image')
    .attr('id', 'LB-face')
    .attr('href', faceMap.get(LBTopPlayer.ID))
    .attr('x', 20)
    .attr('y', 300)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(LBTopPlayer.ID),'LB-face'))

  fieldSVG.append('text')
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

  fieldSVG.append('text')
    .attr('x', 60)
    .attr('y', 320)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(LBTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 60)
    .attr('y', 300)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', 35)
    .attr('y', 290)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#E69225')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', 36)
    .attr('y', 298)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('LAT')

  fieldSVG.append('rect')
    .attr('x', 40 - 30)
    .attr('y', 350)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 43 - 30)
    .attr('y', 365)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#E6C512')
    .text(LBTopPlayer.Name.substr(0,14))

  // --------------------------- RB player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleRB')
    .append('circle')
    .attr('r', radius)
    .attr('cx', fieldWidth - 70)
    .attr('cy', 330);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', fieldWidth - 70)
    .attr('cy', 330)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(RBTopPlayer.Nationality))
    .attr('x', fieldWidth - 90)
    .attr('y', 310)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleRB)');

  fieldSVG.append('image')
    .attr('id', 'RB-face')
    .attr('href', faceMap.get(RBTopPlayer.ID))
    .attr('x', fieldWidth - 70)
    .attr('y', 300)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(RBTopPlayer.ID),'RB-face'))

  fieldSVG.append('text')
    .attr('x', fieldWidth - 30)
    .attr('y', 320)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(RBTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 30)
    .attr('y', 320)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(RBTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 30)
    .attr('y', 300)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', fieldWidth - 55)
    .attr('y', 290)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#E69225')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 54)
    .attr('y', 298)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('LAT')

  fieldSVG.append('rect')
    .attr('x', fieldWidth - 110 + 30)
    .attr('y', 350)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', fieldWidth -107 +30)
    .attr('y', 365)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#E6C512')
    .text(RBTopPlayer.Name.substr(0,14))

  // --------------------------- RCB player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleRCB')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 100)
    .attr('cy', 360);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 100)
    .attr('cy', 360)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(RCBTopPlayer.Nationality))
    .attr('x', 80)
    .attr('y', 340)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleRCB)');

  fieldSVG.append('image')
    .attr('id', 'RCB-face')
    .attr('href', faceMap.get(RCBTopPlayer.ID))
    .attr('x', 100)
    .attr('y', 330)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(RCBTopPlayer.ID),'RCB-face'))

  fieldSVG.append('text')
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

  fieldSVG.append('text')
    .attr('x', 140)
    .attr('y', 350)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(RCBTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 140)
    .attr('y', 330)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', 115)
    .attr('y', 320)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#E69225')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', 116)
    .attr('y', 328)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('ZAG')

  fieldSVG.append('rect')
    .attr('x', 40 + 50)
    .attr('y', 380)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 43 + 50)
    .attr('y', 395)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#E6C512')
    .text(RCBTopPlayer.Name.substr(0,14))

  // --------------------------- LCB player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleLCB')
    .append('circle')
    .attr('r', radius)
    .attr('cx', fieldWidth - 150)
    .attr('cy', 360);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', fieldWidth - 150)
    .attr('cy', 360)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(LCBTopPlayer.Nationality))
    .attr('x', fieldWidth - 170)
    .attr('y', 340)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleLCB)');

  fieldSVG.append('image')
    .attr('id', 'LCB-face')
    .attr('href', faceMap.get(LCBTopPlayer.ID))
    .attr('x', fieldWidth - 150)
    .attr('y', 330)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onerror', checkFace(faceMap.get(LCBTopPlayer.ID),'LCB-face'))

  fieldSVG.append('text')
    .attr('x',  fieldWidth - 110)
    .attr('y', 350)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(LCBTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x',  fieldWidth - 110)
    .attr('y', 350)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(LCBTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 110)
    .attr('y', 330)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', fieldWidth - 135)
    .attr('y', 320)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#E69225')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', fieldWidth - 134)
    .attr('y', 328)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('ZAG')

  fieldSVG.append('rect')
    .attr('x', fieldWidth - 110 -50)
    .attr('y', 380)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', fieldWidth -107 - 50)
    .attr('y', 395)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#E6C512')
    .text(LCBTopPlayer.Name.substr(0,14))

  // --------------------------- GK player --------------------------- //

  fieldSVG.append('clipPath')
    .attr('id', 'clipCircleGK')
    .append('circle')
    .attr('r', radius)
    .attr('cx', 155)
    .attr('cy', fieldHeight - 40);

  fieldSVG.append('circle')
    .attr('r', radius + 2)
    .attr('cx', 155)
    .attr('cy', fieldHeight - 40)
    .attr('fill', '#FFF');

  fieldSVG.append('image')
    .attr('href', flagMap.get(GKTopPlayer.Nationality))
    .attr('x', 135)
    .attr('y', fieldHeight - 60)
    .attr('height', flagSize)
    .attr('width', flagSize)
    .attr('clip-path', 'url(#clipCircleGK)');

  fieldSVG.append('image')
    .attr('id', 'GK-face')
    .attr('href', faceMap.get(GKTopPlayer.ID))
    .attr('x', fieldWidth/2 - 25)
    .attr('y', fieldHeight - 70)
    .attr('height', 50)
    .attr('width', 50)
    .attr('onError', checkFace(faceMap.get(GKTopPlayer.ID),'GK-face'))

  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', fieldHeight - 50)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('stroke', '#1D915B')
    .attr('stroke-width', '5px')
    .attr('textLength', 22)
    .text(GKTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', fieldHeight - 50)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '20px')
    .attr('font-weight', 700)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 22)
    .text(GKTopPlayer.Overall)

  fieldSVG.append('text')
    .attr('x', 195)
    .attr('y', fieldHeight - 70)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 200)
    .attr('fill', '#FFFFFF')
    .attr('textLength', 21.5)
    .text('OVR')

  fieldSVG.append('rect')
    .attr('x', 170)
    .attr('y', fieldHeight - 80)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', '#C739D4')
    .attr('rx', 2)

  fieldSVG.append('text')
    .attr('x', 171)
    .attr('y', fieldHeight - 72)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 700)
    .attr('textLength', 18)
    .attr('fill', '#FFF')
    .text('GOL')

  fieldSVG.append('rect')
    .attr('x', 145)
    .attr('y', fieldHeight - 22)
    .attr('width', 70)
    .attr('height', 20)
    .attr('fill', '#FFFFFF')

  fieldSVG.append('text')
    .attr('x', 148)
    .attr('y', fieldHeight - 8)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '12px')
    .attr('textLength', 64)
    .attr('fill', '#FF8BE0')
    .text(GKTopPlayer.Name.substr(0,14))
}
