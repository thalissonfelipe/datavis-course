// Field
const fieldSVG = d3.select('#field').select('svg');
const fieldWidth = 360;
const fieldHeight = 500;
const radius = 10;
const flagSize = 40;
const jSize = 50;

// rowChart - Top five players
const rowChart = new dc.RowChart('#row-chart');
const rowWidth = 400;
const rowHeight = 200;

// ScatterPlot
const scatterPlotChart = new dc.ScatterPlot('#scatterplot-chart');
const scatterWidth = 400;
const scatterHeight = 200;

// BarChart - Age/Overall
const barChart = new dc.BarChart('#bar-chart');
const barWidth = 400;
const barHeight = 200;

// Leaflet Map
const southWest = L.latLng(-90, -180);
const northEast = L.latLng(90, 180);
const bounds = L.latLngBounds(southWest, northEast);
const map = L.map('mapid', { maxBounds: bounds }).setView([0, 0], 2);
const outline = ({type: 'Sphere'});
const projection = d3.geoNaturalEarth1();
const path = d3.geoPath(projection);
const mapWidth = 975;
const mapHeight = () => 500;
// const mapHeight = () => {
//   const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(mapWidth, outline)).bounds(outline);
//   const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
//   projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
//   return dy;
// };

const colorMap = d3.schemeYlGn[6];

// Maps Constants
const flagID = new Map([
  // EU
  ['Albania', '1'],
  ['Andorra', '2'],
  ['Armenia', '3'],
  ['Austria', '4'],
  ['Azerbaijan', '5'],
  ['Belarus', '6'],
  ['Belgium', '7'],
  ['Bosnia Herzegovina', '8'],
  ['Bulgaria', '9'],
  ['Croatia', '10'],
  ['Cyprus', '11'],
  ['Czech Republic', '12'],
  ['Denmark', '13'],
  ['England', '14'],
  ['Montenegro', '15'],
  ['Finland', '17'],
  ['France', '18'],
  ['North Macedonia', '19'],
  ['Georgia', '20'],
  ['Germany', '21'],
  ['Greece', '22'],
  ['Hungary', '23'],
  ['Iceland', '24'],
  ['Republic of Ireland', '25'],
  ['Israel', '26'],
  ['Italy', '27'],
  ['Latvia', '28'],
  ['Liechtenstein', '29'],
  ['Lithuania', '30'],
  ['Luxembourg', '31'],
  ['Malta', '32'],
  ['Moldova', '33'],
  ['Netherlands', '34'],
  ['Norway', '36'],
  ['Poland', '37'],
  ['Portugal', '38'],
  ['Romania', '39'],
  ['Russia', '40'],
  ['Scotland', '42'],
  ['Slovakia', '43'],
  ['Slovenia', '44'],
  ['Spain', '45'],
  ['Sweden', '46'],
  ['Switzerland', '47'],
  ['Turkey', '48'],
  ['Ukraine', '49'],
  ['Wales', '50'],
  ['Serbia', '51'],

  // SA
  ['Argentina', '52'],
  ['Bolivia', '53'],
  ['Brazil', '54'],
  ['Chile', '55'],
  ['Colombia', '56'],
  ['Ecuador', '57'],
  ['Paraguay', '58'],
  ['Peru', '59'],
  ['Uruguay', '60'],
  ['Venezuela', '61'],

  // NA
  ['Belize', '67'],
  ['Canada', '70'],
  ['Costa Rica', '72'],
  ['Cuba', '73'],
  ['El Salvador', '76'],
  ['Grenada', '77'],
  ['Guyana', '79'],
  ['Haiti', '80'],
  ['Honduras', '81'],
  ['Jamaica', '82'],
  ['Mexico', '83'],
  ['Nicaragua', '86'],
  ['Panama', '87'],
  ['Saint Kitts and Nevis', '89'],
  ['Saint Lucia', '90'],
  ['Suriname', '92'],
  ['Trinidad & Tobago', '93'],
  ['United States', '95'],

  // AF
  ['Algeria', '97'],
  ['Angola', '98'],
  ['Benin', '99'],
  ['Burkina Faso', '101'],
  ['Burundi', '102'],
  ['Cameroon', '103'],
  ['Cape Verde', '104'],
  ['Central African Republic', '105'],
  ['Chad', '106'],
  ['Congo', '107'],
  ['Ivory Coast', '108'],
  ['DR Congo', '110'],
  ['Egypt', '111'],
  ['Equatorial Guinea', '112'],
  ['Eritrea', '113'],
  ['Gabon', '115'],
  ['Gambia', '116'],
  ['Ghana', '117'],
  ['Guinea', '118'],
  ['Guinea Bissau', '119'],
  ['Kenya', '120'],
  ['Liberia', '122'],
  ['Libya', '123'],
  ['Madagascar', '124'],
  ['Malawi', '125'],
  ['Mali', '126'],
  ['Mauritania', '127'],
  ['Morocco', '129'],
  ['Mozambique', '130'],
  ['Namibia', '131'],
  ['Niger', '132'],
  ['Nigeria', '133'],
  ['Rwanda', '134'],
  ['Senegal', '136'],
  ['Sierra Leone', '138'],
  ['South Africa', '140'],
  ['Sudan', '141'],
  ['Tanzania', '143'],
  ['Togo', '144'],
  ['Tunisia', '145'],
  ['Uganda', '146'],
  ['Zambia', '147'],
  ['Zimbabwe', '148'],

  // AS
  ['Afghanistan', '149'],
  ['Bahrain', '150'],
  ['China PR', '155'],
  ['Hong Kong', '158'],
  ['India', '159'],
  ['Indonesia', '160'],
  ['Iran', '161'],
  ['Iraq', '162'],
  ['Japan', '163'],
  ['Jordan', '164'],
  ['Kazakhstan', '165'],
  ['Korea DPR', '166'],
  ['Korea Republic', '167'],
  ['Lebanon', '171'],
  ['Macau', '172'],
  ['Malaysia', '173'],
  ['Oman', '178'],
  ['Palestine', '180'],
  ['Philippines', '181'],
  ['Qatar', '182'],
  ['Saudi Arabia', '183'],
  ['Sri Lanka', '185'],
  ['Syria', '186'],
  ['Thailand', '188'],
  ['United Arab Emirates', '190'],
  ['Uzbekistan', '191'],
  ['Vietnam', '192'],

  // OC
  ['Australia', '195'],
  ['Fiji', '197'],
  ['New Zealand', '198'],
  ['Papua New Guinea', '199'],
  ['Dominican Republic', '207'],
  ['Estonia', '208'],
]);

const rename = new Map([
  ["Antigua and Barbuda", "Antigua and Barb."],
  ["Bolivia (Plurinational State of)", "Bolivia"],
  ["Bosnia Herzegovina", "Bosnia and Herz."],
  ["Brunei Darussalam", "Brunei"],
  ["Central African Republic", "Central African Rep."],
  ["China PR", "China"],
  ["Czech Republic", "Czechia"],
  ["Republic of Ireland", "Ireland"],
  ["Cook Islands", "Cook Is."],
  ["Democratic People's Republic of Korea", "North Korea"],
  ["DR Congo", "Dem. Rep. Congo"],
  ["Dominican Republic", "Dominican Rep."],
  ["Equatorial Guinea", "Eq. Guinea"],
  ["Guinea Bissau", "Guinea-Bissau"],
  ["Iran (Islamic Republic of)", "Iran"],
  ["Ivory Coast", "Côte d'Ivoire"],
  ["Lao People's Democratic Republic", "Laos"],
  ["Marshall Islands", "Marshall Is."],
  ["Micronesia (Federated States of)", "Micronesia"],
  ["Korea Republic", "South Korea"],
  ["Korea DPR", "North Korea"],
  ["Republic of Moldova", "Moldova"],
  ["Russian Federation", "Russia"],
  ["Saint Kitts and Nevis", "St. Kitts and Nevis"],
  ["Saint Vincent and the Grenadines", "St. Vin. and Gren."],
  ["Sao Tome and Principe", "São Tomé and Principe"],
  ["Solomon Islands", "Solomon Is."],
  ["South Sudan", "S. Sudan"],
  ["Swaziland", "eSwatini"],
  ["Syrian Arab Republic", "Syria"],
  ["The former Yugoslav Republic of Macedonia", "Macedonia"],
  ["United Republic of Tanzania", "Tanzania"],
  ["Venezuela (Bolivarian Republic of)", "Venezuela"],
  ["Viet Nam", "Vietnam"]
]);