const fs = require('fs');

let ctx = fs.readFileSync('src/context/FestContext.tsx', 'utf8');
const isCrlf = ctx.includes('\r\n');
const nl = isCrlf ? '\r\n' : '\n';

// 1. Types import
ctx = ctx.replace(
  'HostelRoom' + nl + '} from \'../types/database\';',
  'HostelRoom,' + nl + '  EquipmentDamageLog' + nl + '} from \'../types/database\';'
);

// 2. MockData import
ctx = ctx.replace(
  'INITIAL_STUDENT_VOLUNTEERS' + nl + '} from \'../lib/mockData\';',
  'INITIAL_STUDENT_VOLUNTEERS,' + nl + '  INITIAL_DAMAGE_LOGS' + nl + '} from \'../lib/mockData\';'
);

// 3. FestContextType
const oldTypeSnippet = '  studentVolunteers: StudentVolunteer[];' + nl + '  dismissVolunteer: (volunteerId: string, reason?: string) => void;' + nl + '  reallocateVolunteer: (volunteerId: string, targetEventId: string, targetRole?: string) => void;' + nl + '  assignVolunteer: (volunteerId: string, eventId: string, role?: string) => void;';
const newTypeSnippet = oldTypeSnippet + nl + nl + '  damageLogs: EquipmentDamageLog[];' + nl + '  logEquipmentDamage: (data: Omit<EquipmentDamageLog, \'id\' | \'timestamp\' | \'repairStatus\'>) => void;' + nl + '  resolveEquipmentDamage: (damageLogId: string, resolutionNotes: string) => void;';

ctx = ctx.replace(oldTypeSnippet, newTypeSnippet);

// 4. State
const oldStateSnippet = 'const [studentVolunteers, setStudentVolunteers] = useState<StudentVolunteer[]>(INITIAL_STUDENT_VOLUNTEERS);';
const newStateSnippet = oldStateSnippet + nl + '  const [damageLogs, setDamageLogs] = useState<EquipmentDamageLog[]>(INITIAL_DAMAGE_LOGS);';

ctx = ctx.replace(oldStateSnippet, newStateSnippet);

// 5. Broadcast message handling
ctx = ctx.replace(
  'if (payload.studentVolunteers) setStudentVolunteers(payload.studentVolunteers);',
  'if (payload.studentVolunteers) setStudentVolunteers(payload.studentVolunteers);' + nl + '          if (payload.damageLogs) setDamageLogs(payload.damageLogs);'
);

// 6. Add functions before return
const functionsToAdd = `
  const logEquipmentDamage = useCallback((data: Omit<EquipmentDamageLog, 'id' | 'timestamp' | 'repairStatus'>) => {
    const id = 'DMG-' + Date.now();
    const alertCode = 'ALERT-EQ-' + Math.floor(100 + Math.random() * 900);
    const newLog: EquipmentDamageLog = {
      ...data,
      id,
      timestamp: new Date().toISOString(),
      alertCode,
      repairStatus: 'under_repair'
    };

    setDamageLogs((prev) => [newLog, ...prev]);

    // Update item condition in logistics inventory
    setLogistics((prev) =>
      prev.map((item) =>
        item.id === data.itemId || item.item_id === data.itemId
          ? {
              ...item,
              condition: data.reportedCondition || 'under repair',
              available_quantity: Math.max(0, item.available_quantity - data.quantityAffected)
            }
          : item
      )
    );

    // Connect to Alert System: Broadcast Operational Alert across all 8 dashboards
    broadcastOperationalAlert({
      title: \`Equipment Defect: \${data.itemName} (\${data.itemId})\`,
      severity: data.severity,
      problemDescription: \`\${data.defectDescription} affected \${data.quantityAffected} unit(s) at \${data.depotLocation}.\`,
      operationalImpact: \`Defect flags item condition as '\${data.reportedCondition}'. Operational gear pool reduced.\`,
      requiredAction: \`Logistics repair runner dispatched to \${data.depotLocation}. Fast-track assessment or substitute backup stock.\`,
      reportedBy: data.loggedBy,
      reportedRole: data.loggedRole,
      venueName: data.depotLocation
    });

    broadcastStateUpdate({
      damageLogs: [newLog, ...damageLogs]
    });
  }, [damageLogs, broadcastOperationalAlert, broadcastStateUpdate]);

  const resolveEquipmentDamage = useCallback((damageLogId: string, resolutionNotes: string) => {
    setDamageLogs((prev) =>
      prev.map((log) => {
        if (log.id === damageLogId) {
          return {
            ...log,
            repairStatus: 'repaired',
            resolvedAt: new Date().toISOString(),
            resolutionNotes
          };
        }
        return log;
      })
    );

    const targetLog = damageLogs.find((l) => l.id === damageLogId);
    if (targetLog) {
      setLogistics((prev) =>
        prev.map((item) =>
          item.id === targetLog.itemId || item.item_id === targetLog.itemId
            ? {
                ...item,
                condition: 'good',
                available_quantity: item.available_quantity + targetLog.quantityAffected
              }
            : item
        )
      );

      if (targetLog.alertCode) {
        const matchingAlert = operationalAlerts.find((a) => a.alertCode === targetLog.alertCode);
        if (matchingAlert) {
          resolveOperationalAlert(matchingAlert.id, \`Equipment repaired and recommissioned: \${resolutionNotes}\`);
        }
      }
    }
  }, [damageLogs, operationalAlerts, resolveOperationalAlert]);
`;

// Insert functions before return
const returnIndex = ctx.indexOf('  return (' + nl + '    <FestContext.Provider');
if (returnIndex !== -1) {
  ctx = ctx.slice(0, returnIndex) + functionsToAdd.replace(/\n/g, nl) + ctx.slice(returnIndex);
} else {
  console.error('Could not find FestContext.Provider return point');
}

// 7. Value provider
ctx = ctx.replace(
  'studentVolunteers,' + nl + '        dismissVolunteer,',
  'studentVolunteers,' + nl + '        damageLogs,' + nl + '        logEquipmentDamage,' + nl + '        resolveEquipmentDamage,' + nl + '        dismissVolunteer,'
);

fs.writeFileSync('src/context/FestContext.tsx', ctx, 'utf8');
console.log('src/context/FestContext.tsx updated with damage logging and alert integration');
