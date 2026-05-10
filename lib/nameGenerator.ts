// Fantasy NPC name generator — purely client-side, no API needed

const PREFIXES_MALE = [
  "Ael","Aer","Aldric","Arag","Aran","Aron","Bal","Balar","Balin","Bran",
  "Cael","Cain","Caleb","Dain","Dar","Daren","Dorin","Drak","Duren","Eld",
  "Eldan","Faen","Falk","Faran","Gael","Galin","Garen","Gorin","Hadric","Halen",
  "Ilan","Ivar","Jorin","Kael","Kaen","Kiran","Korin","Laran","Lorn","Lyor",
  "Mael","Maren","Mordain","Nael","Naran","Orin","Oskar","Rael","Ragan","Ralden",
  "Roran","Sael","Saran","Sorin","Tael","Taran","Theron","Torin","Ulric","Vael",
  "Varan","Varek","Wulfar","Xael","Yoran","Zael","Zaran","Aldor","Berin","Calder",
  "Darian","Eadan","Farim","Gideon","Harvin","Iskar","Jareth","Kelan","Lorcan",
];

const PREFIXES_FEMALE = [
  "Ael","Aelara","Aerin","Alara","Alira","Amara","Anwen","Arya","Ayla","Brynn",
  "Caera","Calla","Cari","Celara","Cira","Dara","Daria","Edara","Eila","Elara",
  "Elena","Elira","Emara","Eryn","Faela","Fala","Fara","Gara","Gwyneth","Hara",
  "Ilara","Ilira","Inara","Ireth","Kara","Kaela","Kalia","Lara","Lena","Lira",
  "Lyra","Mara","Mira","Mora","Nara","Nira","Nyra","Opal","Rael","Rana","Rena",
  "Riona","Sara","Sela","Sira","Talia","Tara","Thea","Ulara","Vara","Vela","Vira",
  "Wren","Xara","Ynara","Zara","Zira","Aelia","Bria","Calara","Dael","Elwyn",
  "Faeril","Galaen","Helia","Isara","Jael","Kael","Lael","Miriel","Nael","Oryn",
];

const PREFIXES_NEUTRAL = [
  "Ash","Auren","Bael","Cael","Cyan","Dael","Ember","Fael","Glen","Hael",
  "Ivy","Jade","Kael","Lael","Mael","Nael","Oak","Pael","Quinn","Rael",
  "Sage","Tael","Umber","Vael","Wael","Xael","Yael","Zael","Alder","Birch",
  "Cedar","Drake","Elder","Fern","Gale","Haven","Indigo","Jasper","Kestrel",
];

const SUFFIXES = [
  // Nature/Elements
  "schatten","sturm","feuer","frost","wind","stein","fluss","berg","wald","see",
  "licht","dunkel","nebel","asche","eis","flamme","blatt","blüte","dorn","ranke",
  // Traits
  "herz","seele","geist","klinge","faust","blick","stimme","schritt","hand","auge",
  // Epic
  "bringer","wächter","jäger","streiter","läufer","flüsterer","brecher","sucher","hüter",
  // Compound
  "mondlicht","sternenstaub","silberklinge","goldherz","eisenhand","dunklauge",
  "nebelwanderer","sturmreiter","schattenläufer","feuerfaust",
  // Elven style
  "iel","ien","iel","ariel","oriel","andel","andril","eledh","aledh","iriel",
  // Short
  "ax","or","ar","en","on","an","in","yr","er","al","il","ol","ul",
];

const SINGLE_NAMES = [
  "Erevan","Thandrel","Zephyros","Mireille","Caladwen","Sorvath","Nyxara",
  "Valdris","Aelindra","Torven","Ysolde","Kaelthas","Bryndis","Orinthia",
  "Selvax","Thrandumir","Vesper","Calix","Draven","Isolde","Mordecai",
  "Seraphel","Vexara","Wulfric","Xandrel","Yaren","Zindara","Aelindra",
  "Balthazar","Cyriel","Daelindra","Elspeth","Fiorel","Galindra","Havelock",
  "Inara","Jadrel","Kestara","Lorindra","Mythara","Nerindra","Oberon",
  "Perindra","Quirin","Rindara","Silvara","Tindrel","Uvindra","Verdana",
  "Windara","Xerindra","Yarindra","Zephindra",
];

type Gender = "männlich" | "weiblich" | "divers" | "";

export function randomFantasyName(geschlecht: Gender = ""): string {
  const roll = Math.random();

  // 20 % chance: single exotic name
  if (roll < 0.2) {
    return SINGLE_NAMES[Math.floor(Math.random() * SINGLE_NAMES.length)];
  }

  // Pick first name based on gender
  let pool: string[];
  if (geschlecht === "männlich") pool = PREFIXES_MALE;
  else if (geschlecht === "weiblich") pool = PREFIXES_FEMALE;
  else pool = [...PREFIXES_MALE, ...PREFIXES_FEMALE, ...PREFIXES_NEUTRAL];

  const first = pool[Math.floor(Math.random() * pool.length)];

  // 40 % chance: first name only (feels authentic for some fantasy cultures)
  if (roll < 0.6) return first;

  // 60 % chance: first name + surname
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];

  // Capitalise suffix if it's a word (length > 3), keep lowercase for elven endings
  const surname = suffix.length > 3
    ? suffix.charAt(0).toUpperCase() + suffix.slice(1)
    : suffix;

  return `${first} ${surname}`;
}
