const fs = require('fs');

const invLines = fs.readFileSync('data/full_dataset/inventory_logistics.csv', 'utf8').trim().split('\n').slice(1);

const logisticsItems = invLines.map(line => {
  const [item_id, item, quantity, location, condition] = line.split(',').map(s => s.trim());
  const qty = parseInt(quantity || '0');

  let category = 'av_equipment';
  if (['table', 'chair', 'registration desk'].includes(item)) category = 'furniture';
  else if (['barricade', 'stage panel', 'signage'].includes(item)) category = 'barricades';
  else if (['generator', 'extension cord', 'power strip'].includes(item)) category = 'power_generators';
  else if (['first-aid kit', 'walkie-talkie'].includes(item)) category = 'safety_comms';
  else if (['camera', 'tripod', 'projector', 'lighting rig', 'mic', 'speaker', 'mixer'].includes(item)) category = 'av_equipment';

  const inUse = condition === 'good' ? Math.min(qty, Math.floor(qty * 0.4)) : 0;
  const avail = Math.max(0, qty - inUse);

  return {
    id: item_id,
    item_id,
    item_name: item.charAt(0).toUpperCase() + item.slice(1),
    item,
    category,
    total_quantity: qty,
    quantity: qty,
    in_use_quantity: inUse,
    available_quantity: avail,
    location,
    condition
  };
});

console.log('Total logistics items generated:', logisticsItems.length);

// Generate damage logs from items that have condition 'under repair' or 'needs check'
const defectItems = logisticsItems.filter(i => i.condition === 'under repair' || i.condition === 'needs check');
console.log('Total defect items in dataset:', defectItems.length);

const damageLogs = defectItems.map((item, idx) => {
  const isRepair = item.condition === 'under repair';
  const severity = isRepair ? (['camera', 'speaker', 'generator', 'lighting rig'].includes(item.item) ? 'critical' : 'high') : 'medium';
  
  let defectNote = 'Routine maintenance check flagged during shift handoff.';
  if (item.item === 'camera') defectNote = 'Shutter mechanism jammed; internal optical sensor calibration failed.';
  else if (item.item === 'speaker') defectNote = 'Blown high-frequency driver coil after heavy load testing.';
  else if (item.item === 'lighting rig') defectNote = 'DMX control board short circuit; intermittent strobe trigger.';
  else if (item.item === 'generator') defectNote = 'Coolant line pressure drop during test run; filter replacement scheduled.';
  else if (item.item === 'extension cord') defectNote = 'Outer rubber insulation frayed near male 16A plug head.';
  else if (item.item === 'projector') defectNote = 'Lamp module reached 3200 hours limit; color distortion on lens.';
  else if (item.item === 'mixer') defectNote = 'Fader channel 3 and 4 crackling; potentiometer replacement requested.';
  else if (item.item === 'barricade') defectNote = 'Locking pin bent; needs welding adjustment before crowd deployment.';
  else if (item.item === 'table') defectNote = 'Leg hinge bracket loose; stability compromise under heavy display load.';
  else if (item.item === 'chair') defectNote = 'Backrest frame stress fracture detected during pre-contingent setup.';
  else if (item.item === 'signage') defectNote = 'Directional vinyl torn; frame bracket bent during transit.';
  else if (item.item === 'first-aid kit') defectNote = 'Antiseptic supplies and burn dressings below mandatory inventory threshold.';
  else if (item.item === 'walkie-talkie') defectNote = 'Antenna cracked; Channel 3 transmitter gain degraded.';
  else if (item.item === 'tripod') defectNote = 'Pan-tilt fluid head friction knob slipping.';
  else if (item.item === 'stage panel') defectNote = 'Corner plywood gouged; anti-slip coating peeling.';
  else if (item.item === 'power strip') defectNote = 'Surge protector reset switch tripped and locked open.';
  else if (item.item === 'registration desk') defectNote = 'Front modesty panel detached; structural screw missing.';

  return {
    id: `DMG-${String(idx + 1).padStart(3, '0')}`,
    itemId: item.id,
    itemName: item.item_name,
    quantityAffected: item.total_quantity,
    depotLocation: item.location,
    severity,
    reportedCondition: item.condition,
    defectDescription: defectNote,
    loggedBy: idx % 2 === 0 ? 'Vikram Rathore' : 'Kunal Singhal',
    loggedRole: 'Logistics Operations Assistant',
    timestamp: new Date(Date.now() - (idx + 1) * 3600000 * 2).toISOString(),
    alertCode: `ALERT-EQ-${100 + idx}`,
    repairStatus: isRepair ? 'under_repair' : 'investigating'
  };
});

console.log('Generated damage logs:', damageLogs.length);

// Write to a helper json or script that updates mockData.ts
fs.writeFileSync('src/lib/logisticsCanonical.json', JSON.stringify({
  logistics: logisticsItems,
  damageLogs: damageLogs
}, null, 2), 'utf8');

console.log('Saved src/lib/logisticsCanonical.json');
