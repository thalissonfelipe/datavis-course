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

function bilink(root) {
  const map = new Map(root.leaves().map(d => [d.data.club, d]));
  for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.targets.map(i => [d, map.get(i)]);
  for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
  return root;
}

function getPlayer(players, position, substitutes, SUBSTITUTIONS_COUNT) {
  let player = players.find(d => d['Best Position'] === position);
  if (!player) {
    for (let i = 0; i < substitutes.length; i++) {
      player = players.filter(d => d['Best Position'] === substitutes[i]);
      switch (substitutes[i]) {
        case 'CF':
          player = player[SUBSTITUTIONS_COUNT[substitutes[i]]];
          SUBSTITUTIONS_COUNT[substitutes[i]] += 1;
          break;
        default:
          player = player[SUBSTITUTIONS_COUNT[substitutes[i]] + 1];
          SUBSTITUTIONS_COUNT[substitutes[i]] += 1;
          break;
      }
      if (player) {
        return player;
      }
    }
  }
  return player;
}

function loadText() {
  fieldSVG.append('text')
    .attr('x', 30)
    .attr('y', 130)
    .style('fill', '#FFF')
    .style('font-weight', 'bold')
    .text('País selecionado não possui jogadores');
  
  fieldSVG.append('text')
    .attr('x', 50)
    .attr('y', 160)
    .style('fill', '#FFF')
    .style('font-weight', 'bold')
    .text('suficientes para montar um time.');
}
