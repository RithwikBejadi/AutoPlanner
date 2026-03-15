# Repository Implementation Templates

## Overview
This directory contains templates for implementing the Repository Pattern with Prisma ORM.

---

## 📁 File Structure

```
repositories/
├── interfaces/          # Repository contracts (TypeScript interfaces)
│   ├── ISubjectRepository.ts         ✅ COMPLETED
│   ├── IRoomRepository.ts            ✅ COMPLETED
│   ├── ITimeSlotRepository.ts        ✅ COMPLETED
│   ├── IClassGroupRepository.ts      ✅ COMPLETED
│   ├── ITeacherRepository.ts         ✅ COMPLETED
│   └── ITimetableRepository.ts       ✅ COMPLETED
│
├── implementations/     # Concrete Prisma implementations
│   ├── PrismaSubjectRepository.ts    ✅ COMPLETED
│   ├── PrismaRoomRepository.ts       ✅ COMPLETED
│   ├── PrismaTimeSlotRepository.ts   ✅ COMPLETED
│   ├── PrismaClassGroupRepository.ts ✅ COMPLETED
│   ├── PrismaTeacherRepository.ts    ✅ COMPLETED
│   └── PrismaTimetableRepository.ts  ✅ COMPLETED
│
└── index.ts             # Barrel export for all repositories
```

---

## 🎯 Implementation Order (Recommended)

1. ✅ **SubjectRepository** - Simple entity, no relations (DONE - use as reference)
2. **RoomRepository** - Simple entity, no complex relations
3. **TimeSlotRepository** - Simple entity with time parsing
4. **ClassGroupRepository** - Simple entity, no complex relations
5. **TeacherRepository** - Complex: many-to-many with subjects & availability
6. **TimetableRepository** - Most complex: manages ScheduleEntry collection

---

## 📝 Template Pattern

### **1. Interface Template**

```typescript
import { EntityName } from '../../domain/entities/EntityName.js';

export interface IEntityNameRepository {
  // CREATE
  create(entity: EntityName): Promise<EntityName>;
  
  // READ
  findById(id: string): Promise<EntityName | null>;
  findAll(): Promise<EntityName[]>;
  // Add custom queries specific to this entity
  
  // UPDATE
  update(id: string, entity: EntityName): Promise<EntityName>;
  
  // DELETE
  delete(id: string): Promise<void>;
  
  // UTILITIES
  exists(id: string): Promise<boolean>;
}
```

### **2. Implementation Template**

```typescript
import { EntityName } from '../../domain/entities/EntityName.js';
import { IEntityNameRepository } from '../interfaces/IEntityNameRepository.js';
import prisma from '../../database/prisma.js';
import type { EntityName as PrismaEntityName } from '@prisma/client';

export class PrismaEntityNameRepository implements IEntityNameRepository {
  
  // MAPPER: Prisma → Domain
  private toDomain(prismaEntity: PrismaEntityName): EntityName {
    return new EntityName(
      prismaEntity.id,
      // ... map all fields
    );
  }

  // MAPPER: Domain → Prisma
  private toPrismaData(entity: EntityName) {
    return {
      id: entity.getId(),
      // ... map all fields
    };
  }

  // CRUD methods using mappers...
  async create(entity: EntityName): Promise<EntityName> {
    const data = this.toPrismaData(entity);
    const created = await prisma.entityName.create({ data });
    return this.toDomain(created);
  }
  
  // ... implement all interface methods
}
```

---

## 🔧 Specific Templates

### **IRoomRepository.ts**

```typescript
import { Room } from '../../domain/entities/Room.js';

export interface IRoomRepository {
  create(room: Room): Promise<Room>;
  findById(id: string): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  findByMinCapacity(minCapacity: number): Promise<Room[]>;
  findWithLabEquipment(): Promise<Room[]>;
  update(id: string, room: Room): Promise<Room>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### **ITimeSlotRepository.ts**

```typescript
import { TimeSlot } from '../../domain/entities/TimeSlot.js';

export interface ITimeSlotRepository {
  create(timeSlot: TimeSlot): Promise<TimeSlot>;
  findById(id: string): Promise<TimeSlot | null>;
  findAll(): Promise<TimeSlot[]>;
  findByDay(day: string): Promise<TimeSlot[]>;
  findOverlapping(timeSlot: TimeSlot): Promise<TimeSlot[]>;
  update(id: string, timeSlot: TimeSlot): Promise<TimeSlot>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

**Note:** TimeSlot stores `startTime`/`endTime` as strings in DB (e.g., "09:00") but uses Date objects in domain entity. You'll need conversion helpers:

```typescript
// Helper functions for TimeSlot
private parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

private formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
}

private toDomain(prismaTimeSlot: PrismaTimeSlot): TimeSlot {
  return new TimeSlot(
    prismaTimeSlot.day,
    this.parseTime(prismaTimeSlot.startTime),
    this.parseTime(prismaTimeSlot.endTime)
  );
}

private toPrismaData(timeSlot: TimeSlot) {
  return {
    day: timeSlot.getDay(),
    startTime: this.formatTime(timeSlot.getStartTime()),
    endTime: this.formatTime(timeSlot.getEndTime()),
  };
}
```

### **IClassGroupRepository.ts**

```typescript
import { ClassGroup } from '../../domain/entities/ClassGroup.js';

export interface IClassGroupRepository {
  create(classGroup: ClassGroup): Promise<ClassGroup>;
  findById(id: string): Promise<ClassGroup | null>;
  findAll(): Promise<ClassGroup[]>;
  update(id: string, classGroup: ClassGroup): Promise<ClassGroup>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### **ITeacherRepository.ts** (Complex!)

```typescript
import { Teacher } from '../../domain/entities/Teacher.js';
import { TimeSlot } from '../../domain/entities/TimeSlot.js';

export interface ITeacherRepository {
  create(teacher: Teacher): Promise<Teacher>;
  findById(id: string): Promise<Teacher | null>;
  findAll(): Promise<Teacher[]>;
  findByEmail(email: string): Promise<Teacher | null>;
  findQualifiedForSubject(subjectId: string): Promise<Teacher[]>;
  findAvailableAt(timeSlot: TimeSlot): Promise<Teacher[]>;
  update(id: string, teacher: Teacher): Promise<Teacher>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  
  // Relationship management
  addSubjectQualification(teacherId: string, subjectId: string): Promise<void>;
  removeSubjectQualification(teacherId: string, subjectId: string): Promise<void>;
  setAvailability(teacherId: string, timeSlots: TimeSlot[]): Promise<void>;
}
```

**Important for TeacherRepository:**
- Teacher has many-to-many with Subject (via TeacherSubject junction table)
- Teacher has many-to-many with TimeSlot (via TeacherTimeSlot junction table)
- Use Prisma `include` to load relations:

```typescript
async findById(id: string): Promise<Teacher | null> {
  const found = await prisma.teacher.findUnique({
    where: { id },
    include: {
      subjects: { include: { subject: true } },
      availability: { include: { timeSlot: true } }
    }
  });
  
  if (!found) return null;
  
  return new Teacher(
    found.id,
    found.name,
    found.email,
    found.subjects.map(ts => ts.subject.id),
    found.availability.map(ta => 
      new TimeSlot(
        ta.timeSlot.day,
        parseTime(ta.timeSlot.startTime),
        parseTime(ta.timeSlot.endTime)
      )
    )
  );
}
```

### **ITimetableRepository.ts** (Most Complex!)

```typescript
import { Timetable } from '../../domain/entities/Timetable.js';
import { ScheduleEntry } from '../../domain/entities/ScheduleEntry.js';

export interface ITimetableRepository {
  create(timetable: Timetable): Promise<Timetable>;
  findById(id: string): Promise<Timetable | null>;
  findAll(): Promise<Timetable[]>;
  findLatest(): Promise<Timetable | null>;
  
  // Save complete timetable with all entries
  save(timetable: Timetable): Promise<Timetable>;
  
  // Load timetable with all schedule entries
  loadWithEntries(id: string): Promise<Timetable | null>;
  
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

**TimetableRepository challenges:**
1. Need to load ALL related entities for ScheduleEntry (Teacher, Room, Subject, ClassGroup, TimeSlot)
2. Need to save/delete entries in transaction
3. Use deep Prisma includes:

```typescript
async loadWithEntries(id: string): Promise<Timetable | null> {
  const found = await prisma.timetable.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          teacher: { include: { subjects: true, availability: true } },
          room: true,
          subject: true,
          classGroup: true,
          timeSlot: true
        }
      }
    }
  });
  
  if (!found) return null;
  
  const timetable = new Timetable(found.id, found.createdAt, found.updatedAt);
  
  for (const entry of found.entries) {
    const scheduleEntry = new ScheduleEntry(
      entry.id,
      this.mapTeacher(entry.teacher),
      this.mapRoom(entry.room),
      this.mapSubject(entry.subject),
      this.mapClassGroup(entry.classGroup),
      this.mapTimeSlot(entry.timeSlot)
    );
    timetable.addEntry(scheduleEntry);
  }
  
  return timetable;
}
```

---

## ⚠️ Important Notes

### **1. Missing: Teacher.email field**
Before implementing TeacherRepository, add `email` to Teacher entity:

```typescript
// In Teacher.ts
private readonly _email: string;

constructor(
  id: string,
  name: string,
  email: string,  // ADD THIS
  qualifiedSubjects: string[],
  availability: TimeSlot[]
) {
  // Add validation
  if (!email || !email.includes('@')) {
    throw new Error("Valid email is required");
  }
  this._email = email;
}

getEmail(): string {
  return this._email;
}
```

### **2. Environment Setup**
Create `.env` file in `/server/`:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/autoplanner?schema=public"
NODE_ENV="development"
```

### **3. Generate Prisma Client**
Run before implementing repositories:

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### **4. Error Handling**
Wrap Prisma calls in try-catch:

```typescript
async create(entity: Entity): Promise<Entity> {
  try {
    const data = this.toPrismaData(entity);
    const created = await prisma.entity.create({ data });
    return this.toDomain(created);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error(`Entity with unique constraint already exists`);
    }
    throw error;
  }
}
```

Common Prisma error codes:
- `P2002`: Unique constraint violation
- `P2025`: Record not found
- `P2003`: Foreign key constraint violation

---

## 🚀 Next Steps

1. Add `email` field to Teacher entity
2. Create `.env` file with DATABASE_URL
3. Run `npx prisma generate`
4. Implement repositories in order (Room → TimeSlot → ClassGroup → Teacher → Timetable)
5. Test each repository before moving to next

Good luck! 🎯
