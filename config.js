// PROTOTYPE - NOT FOR PRODUCTION
// Question: Kaydırarak falsolu şut atmak 10 level boyunca eğlenceli ve öğrenilebilir mi?
// Date: 2026-11-10
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
window.CONFIG = {
  seed: 1, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address)
  volume: { value: 0.5, min: 0, max: 1, step: 0.05 },

  // --- Ball physics ---
  gravity: { value: 9.81, min: 5, max: 15, step: 0.1 },            // m/s²
  drag: { value: 0.010, min: 0, max: 0.03, step: 0.001 },           // air drag, 1/m (a = -k·v·|v|)
  shot_speed_min: { value: 16, min: 8, max: 25, step: 0.5 },        // m/s at the slowest swipe
  shot_speed_max: { value: 30, min: 20, max: 40, step: 0.5 },       // m/s at the fastest swipe
  curve_accel: { value: 7.5, min: 0, max: 15, step: 0.25 },         // m/s² sideways at full spin
  curve_comp: { value: 0.45, min: 0, max: 1, step: 0.05 },          // share of the curve aimed out for you (1 = ball ends where you aimed)
  max_pitch_deg: { value: 38, min: 15, max: 60, step: 1 },          // steepest launch, degrees

  // --- Swipe → shot ---
  swipe_speed_min: { value: 500, min: 100, max: 1500, step: 50 },   // logical px/s = slowest shot
  swipe_speed_max: { value: 2300, min: 1200, max: 4000, step: 50 }, // logical px/s = hardest shot
  swipe_min_len: { value: 50, min: 10, max: 150, step: 5 },         // logical px: shorter is ignored
  aim_gain: { value: 2.0, min: 1, max: 4, step: 0.1 },              // swipe vector × this = aim point on screen
  curve_full_deg: { value: 55, min: 20, max: 120, step: 5 },        // swipe turn (degrees) that gives full spin
  sweet_lo: { value: 0.64, min: 0, max: 1, step: 0.01 },            // power window for a perfect strike
  sweet_hi: { value: 0.86, min: 0, max: 1, step: 0.01 },
  sweet_speed_bonus: { value: 0.06, min: 0, max: 0.2, step: 0.01 }, // extra speed on a perfect strike
  aim_noise_deg: { value: 3.5, min: 0, max: 10, step: 0.25 },       // aim error at the worst power, degrees

  // --- Keyboard aiming (desktop) ---
  key_aim_speed: { value: 2.6, min: 0.5, max: 6, step: 0.1 },       // m/s the reticle moves
  key_charge_time: { value: 0.9, min: 0.3, max: 2, step: 0.05 },    // s for the power bar to fill

  // --- Opponents ---
  wall_height: { value: 1.85, min: 1.5, max: 2.1, step: 0.05 },     // m
  wall_jump_height: { value: 0.45, min: 0, max: 0.8, step: 0.05 },  // m at the top of the jump
  wall_jump_delay: { value: 0.12, min: 0, max: 0.5, step: 0.01 },   // s after the kick
  wall_member_halfwidth: { value: 0.28, min: 0.15, max: 0.4, step: 0.01 }, // m
  keeper_fk_extra_react: { value: 0.12, min: 0, max: 0.4, step: 0.01 },    // s: the wall hides the ball
  ring_radius: { value: 0.5, min: 0.25, max: 0.9, step: 0.05 },     // m

  // --- Camera & pacing ---
  cam_back: { value: 3.2, min: 1.5, max: 6, step: 0.1 },            // m behind the ball
  cam_height: { value: 1.9, min: 1, max: 4, step: 0.1 },            // m
  focal: { value: 1180, min: 600, max: 1600, step: 10 },            // px; grows on long free kicks
  result_hold: { value: 1.6, min: 0.6, max: 3, step: 0.1 },         // s the outcome stays on screen
  shots_per_level: { value: 3, min: 1, max: 6, step: 1 },
};

// The ten levels. Distances in metres from the goal line, x is sideways (+ right).
// react: keeper's reaction (s) · kspeed: keeper's move speed (m/s) · reach: save radius (m)
// kerr: keeper's read error (m) · guess: chance a penalty keeper commits to a side at the kick
// wall: men in the wall · wallAim: x on the goal line the wall lines up on · jump: wall jumps
// wind: sideways push (m/s², + right) · need: goals out of the shots to pass · rings: [x, y] in the goal
window.LEVELS = [
  { type: 'P', x: 0, d: 11, wall: 0, react: 0.50, kspeed: 2.5, reach: 0.85, kerr: 0.60, guess: 0, wind: 0, need: 2, rings: [[2.6, 1.7]], ringFrom: 1, kx: 0 },
  { type: 'F', x: -2.5, d: 18, wall: 2, wallAim: -1.2, jump: false, react: 0.45, kspeed: 3.0, reach: 0.85, kerr: 0.5, guess: 0, wind: 0, need: 2, rings: [[2.7, 1.6]], kx: 0.6 },
  { type: 'F', x: 5, d: 20, wall: 4, wallAim: 2.2, jump: false, react: 0.40, kspeed: 3.4, reach: 0.90, kerr: 0.45, guess: 0, wind: 0, need: 2, rings: [[2.8, 1.9]], kx: -1.2 },
  { type: 'P', x: 0, d: 11, wall: 0, react: 0.25, kspeed: 4.5, reach: 0.95, kerr: 0.35, guess: 0.5, wind: 0, need: 2, rings: [[-2.9, 0.5], [2.9, 1.9]], kx: 0 },
  { type: 'F', x: -4, d: 22, wall: 4, wallAim: -2.0, jump: true, react: 0.35, kspeed: 4.0, reach: 0.95, kerr: 0.40, guess: 0, wind: 0, need: 2, rings: [[-2.8, 1.9]], kx: 1.0 },
  { type: 'F', x: 0, d: 24, wall: 5, wallAim: 0, jump: true, react: 0.32, kspeed: 4.4, reach: 1.00, kerr: 0.35, guess: 0, wind: 0, need: 2, rings: [[-2.9, 2.0], [2.9, 2.0]], kx: 0 },
  { type: 'F', x: 6, d: 21, wall: 4, wallAim: 2.0, jump: true, react: 0.30, kspeed: 4.6, reach: 1.00, kerr: 0.35, guess: 0, wind: -1.6, need: 2, rings: [[2.9, 1.8]], kx: -1.1 },
  { type: 'P', x: 0, d: 11, wall: 0, react: 0.20, kspeed: 5.0, reach: 1.00, kerr: 0.30, guess: 0.6, wind: 2.0, need: 2, rings: [[-3.0, 1.9]], kx: 0 },
  { type: 'F', x: -6.5, d: 25, wall: 5, wallAim: -2.2, jump: true, react: 0.28, kspeed: 4.8, reach: 1.05, kerr: 0.30, guess: 0, wind: 2.4, need: 2, rings: [[-2.9, 1.9]], kx: 1.1 },
  { type: 'F', x: 3, d: 27, wall: 5, wallAim: 1.2, jump: true, react: 0.25, kspeed: 5.2, reach: 1.10, kerr: 0.25, guess: 0, wind: -2.8, need: 2, rings: [[3.0, 2.0], [-3.0, 0.6]], kx: -0.9 },
];

// One teaching line per level, shown before its first shot (second line: shown from shot 2).
window.HINTS = [
  ['Topu yukarı kaydır: hızlı kaydır, sert vur!', 'Altın halkayı vur: +1 yıldız'],
  ['Kavisli kaydır: top da kıvrılır', ''],
  ['Baraj yakın köşeyi kapatıyor: falsoyla dolan!', ''],
  ['Kaleci artık köşe tahmin ediyor', ''],
  ['Baraj zıplıyor: üstünden değil, yanından kıvır', ''],
  ['Tam karşıdan, uzak mesafe: güç şart', ''],
  ['Rüzgâr var: oka göre nişan al', ''],
  ['Rüzgârlı penaltı: kaleciyi ters köşeye yatır', ''],
  ['Uzak açı, sert rüzgâr', ''],
  ['Son level: ustalık zamanı!', ''],
];
