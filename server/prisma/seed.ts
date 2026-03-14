
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});



const TEACHER_IDS = {
  alice:   'a1000000-0000-4000-8000-000000000001',
  bob:     'a1000000-0000-4000-8000-000000000002',
  carol:   'a1000000-0000-4000-8000-000000000003',
  dave:    'a1000000-0000-4000-8000-000000000004',
  eve:     'a1000000-0000-4000-8000-000000000005',
};

const ROOM_IDS = {
  lab1:    'b1000000-0000-4000-8000-000000000001',
  lab2:    'b1000000-0000-4000-8000-000000000002',
  room101: 'b1000000-0000-4000-8000-000000000003',
  room102: 'b1000000-0000-4000-8000-000000000004',
  room103: 'b1000000-0000-4000-8000-000000000005',
  room104: 'b1000000-0000-4000-8000-000000000006',
};

const SUBJECT_IDS = {
  math:    'c1000000-0000-4000-8000-000000000001',
  physics: 'c1000000-0000-4000-8000-000000000002',
  cs:      'c1000000-0000-4000-8000-000000000003',
  english: 'c1000000-0000-4000-8000-000000000004',
  chem:    'c1000000-0000-4000-8000-000000000005',
  history: 'c1000000-0000-4000-8000-000000000006',
};

const CLASS_IDS = {
  a: 'd1000000-0000-4000-8000-000000000001',
  b: 'd1000000-0000-4000-8000-000000000002',
  c: 'd1000000-0000-4000-8000-000000000003',
};



function tsId(index: number): string {
  return `e1${String(index).padStart(6, '0')}-0000-4000-8000-000000000000`;
}



const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
];


const TIME_SLOTS = DAYS.flatMap((day, di) =>
  SLOTS.map((s, si) => ({
    id:        tsId(di * 5 + si + 1),
    day,
    startTime: s.start,
    endTime:   s.end,
  })),
);


const ALL_TS_IDS = TIME_SLOTS.map(ts => ts.id);



async function main() {
  console.log('🌱  Seeding AutoPlanner database…\n');

  
  console.log('  📅  Upserting time slots…');
  for (const ts of TIME_SLOTS) {
    await prisma.timeSlot.upsert({
      where:  { id: ts.id },
      update: { day: ts.day, startTime: ts.startTime, endTime: ts.endTime },
      create: ts,
    });
  }
  console.log(`     ✓ ${TIME_SLOTS.length} time slots`);

  
  console.log('  📚  Upserting subjects…');
  const subjects = [
    { id: SUBJECT_IDS.math,    name: 'Mathematics',     code: 'MATH101', hoursPerWeek: 5, requiresLab: false, maxSessionsPerDay: 2 },
    { id: SUBJECT_IDS.physics, name: 'Physics',         code: 'PHYS101', hoursPerWeek: 4, requiresLab: true,  maxSessionsPerDay: 2 },
    { id: SUBJECT_IDS.cs,      name: 'Computer Science',code: 'CS101',   hoursPerWeek: 4, requiresLab: true,  maxSessionsPerDay: 2 },
    { id: SUBJECT_IDS.english, name: 'English',         code: 'ENG101',  hoursPerWeek: 3, requiresLab: false, maxSessionsPerDay: 1 },
    { id: SUBJECT_IDS.chem,    name: 'Chemistry',       code: 'CHEM101', hoursPerWeek: 3, requiresLab: false, maxSessionsPerDay: 2 },
    { id: SUBJECT_IDS.history, name: 'History',         code: 'HIST101', hoursPerWeek: 2, requiresLab: false, maxSessionsPerDay: 1 },
  ];
  for (const s of subjects) {
    await prisma.subject.upsert({ where: { id: s.id }, update: s, create: s });
  }
  console.log(`     ✓ ${subjects.length} subjects`);

  
  console.log('  🏫  Upserting rooms…');
  const rooms = [
    { id: ROOM_IDS.lab1,    name: 'Science Lab 1', capacity: 30, hasLabEquipment: true  },
    { id: ROOM_IDS.lab2,    name: 'Science Lab 2', capacity: 25, hasLabEquipment: true  },
    { id: ROOM_IDS.room101, name: 'Room 101',       capacity: 40, hasLabEquipment: false },
    { id: ROOM_IDS.room102, name: 'Room 102',       capacity: 35, hasLabEquipment: false },
    { id: ROOM_IDS.room103, name: 'Room 103',       capacity: 30, hasLabEquipment: false },
    { id: ROOM_IDS.room104, name: 'Room 104',       capacity: 45, hasLabEquipment: false },
  ];
  for (const r of rooms) {
    await prisma.room.upsert({ where: { id: r.id }, update: r, create: r });
  }
  console.log(`     ✓ ${rooms.length} rooms`);

  
  console.log('  👩‍🏫  Upserting teachers…');
  const teachers = [
    { id: TEACHER_IDS.alice, name: 'Alice Johnson', email: 'alice.johnson@school.edu' },
    { id: TEACHER_IDS.bob,   name: 'Bob Smith',     email: 'bob.smith@school.edu'     },
    { id: TEACHER_IDS.carol, name: 'Carol Davis',   email: 'carol.davis@school.edu'   },
    { id: TEACHER_IDS.dave,  name: 'Dave Wilson',   email: 'dave.wilson@school.edu'   },
    { id: TEACHER_IDS.eve,   name: 'Eve Martinez',  email: 'eve.martinez@school.edu'  },
  ];
  for (const t of teachers) {
    await prisma.teacher.upsert({ where: { id: t.id }, update: t, create: t });
  }
  console.log(`     ✓ ${teachers.length} teachers`);

  
  console.log('  🔗  Setting teacher-subject qualifications…');
  
  await prisma.teacherSubject.deleteMany({
    where: { teacherId: { in: Object.values(TEACHER_IDS) } },
  });
  await prisma.teacherSubject.createMany({
    data: [
      
      { teacherId: TEACHER_IDS.alice, subjectId: SUBJECT_IDS.math    },
      { teacherId: TEACHER_IDS.alice, subjectId: SUBJECT_IDS.english  },
      
      { teacherId: TEACHER_IDS.bob,   subjectId: SUBJECT_IDS.physics  },
      { teacherId: TEACHER_IDS.bob,   subjectId: SUBJECT_IDS.chem     },
      
      { teacherId: TEACHER_IDS.carol, subjectId: SUBJECT_IDS.cs       },
      { teacherId: TEACHER_IDS.carol, subjectId: SUBJECT_IDS.math     },
      
      { teacherId: TEACHER_IDS.dave,  subjectId: SUBJECT_IDS.history  },
      { teacherId: TEACHER_IDS.dave,  subjectId: SUBJECT_IDS.english  },
      
      { teacherId: TEACHER_IDS.eve,   subjectId: SUBJECT_IDS.chem     },
      { teacherId: TEACHER_IDS.eve,   subjectId: SUBJECT_IDS.physics  },
    ],
  });
  console.log('     ✓ teacher-subject qualifications');

  
  console.log('  ⏰  Setting teacher availability…');
  await prisma.teacherTimeSlot.deleteMany({
    where: { teacherId: { in: Object.values(TEACHER_IDS) } },
  });

  const availData: { teacherId: string; timeSlotId: string }[] = [];
  for (const tid of Object.values(TEACHER_IDS)) {
    for (const tsid of ALL_TS_IDS) {
      availData.push({ teacherId: tid, timeSlotId: tsid });
    }
  }
  
  await prisma.teacherTimeSlot.createMany({ data: availData, skipDuplicates: true });
  console.log(`     ✓ ${availData.length} availability records`);

  
  console.log('  🎓  Upserting class groups…');
  const classGroups = [
    { id: CLASS_IDS.a, name: 'Class 10-A', studentCount: 28 },
    { id: CLASS_IDS.b, name: 'Class 10-B', studentCount: 30 },
    { id: CLASS_IDS.c, name: 'Class 10-C', studentCount: 24 },
  ];
  for (const cg of classGroups) {
    await prisma.classGroup.upsert({ where: { id: cg.id }, update: cg, create: cg });
  }
  console.log(`     ✓ ${classGroups.length} class groups`);

  
  const counts = await Promise.all([
    prisma.teacher.count(),
    prisma.room.count(),
    prisma.subject.count(),
    prisma.classGroup.count(),
    prisma.timeSlot.count(),
    prisma.teacherSubject.count(),
    prisma.teacherTimeSlot.count(),
  ]);

  console.log('\n✅  Seed complete!\n');
  console.log('   Teachers      :', counts[0]);
  console.log('   Rooms         :', counts[1]);
  console.log('   Subjects      :', counts[2]);
  console.log('   Class Groups  :', counts[3]);
  console.log('   Time Slots    :', counts[4]);
  console.log('   T→Subject links:', counts[5]);
  console.log('   T→Slot links  :', counts[6]);
  console.log('\n   Run `npm run dev` then POST /api/timetables/generate\n');
}

main()
  .catch(err => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
