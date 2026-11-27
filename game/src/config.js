// Config, constants, and game balance tuning for Gobble's Great Escape

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const GROUND_Y = 440;

export const STAGES = [
  {
    id: 1,
    name: 'Stage 1: Farmyard Frenzy',
    subtitle: 'Flee Farmer John through the muddy barnyard!',
    length: 2200,
    bgColorTop: '#3a2012',
    bgColorBottom: '#7a3e1d',
    groundColor: '#5c3818',
    groundAccent: '#42240c',
    scenery: 'barnyard',
    enemySpeedBase: 2.2,
    hazardFrequency: 0.012,
    cornDensity: 0.035
  },
  {
    id: 2,
    name: 'Stage 2: Cornfield Labyrinth',
    subtitle: 'Lose the hunting hound in the towering maize!',
    length: 2800,
    bgColorTop: '#2b2111',
    bgColorBottom: '#5c481e',
    groundColor: '#4a3b1a',
    groundAccent: '#332710',
    scenery: 'cornfield',
    enemySpeedBase: 2.8,
    hazardFrequency: 0.018,
    cornDensity: 0.045
  },
  {
    id: 3,
    name: 'Stage 3: The Fiery Kitchen',
    subtitle: 'Dodge Chef Pierre, soaring cleavers & roaring ovens!',
    length: 3400,
    bgColorTop: '#33120d',
    bgColorBottom: '#6e2715',
    groundColor: '#4d2318',
    groundAccent: '#2b100a',
    scenery: 'kitchen',
    enemySpeedBase: 3.4,
    hazardFrequency: 0.024,
    cornDensity: 0.05
  }
];

export const PLAYER_CONFIG = {
  startX: 180,
  width: 48,
  height: 48,
  gravity: 0.58,
  jumpPower: -11.5,
  flutterPower: -3.8,
  maxFlutters: 2,
  slideHeight: 28,
  dashSpeed: 6.5,
  dashDuration: 22,
  dashCooldown: 90,
  maxLives: 3,
  invulnerableDuration: 85
};

export const COLOR_PALETTE = {
  turkeyBrown: '#8B4513',
  turkeyFeather: '#A0522D',
  turkeyTail: '#CD853F',
  turkeySnood: '#D32F2F',
  turkeyBeak: '#FFB300',
  cornYellow: '#FFD700',
  pumpkinOrange: '#FF7043',
  leafGold: '#FBC02D',
  hayTan: '#D7CCC8',
  woodBrown: '#5D4037',
  dangerRed: '#E53935',
  metalSilver: '#ECEFF1',
  bushGreen: '#33691E'
};
