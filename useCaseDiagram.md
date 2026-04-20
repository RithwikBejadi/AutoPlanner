```mermaid
flowchart TD

Admin --> AddTeacher
Admin --> AddRoom
Admin --> AddSubject
Admin --> AddClass
Admin --> DefineConstraints
Admin --> GenerateTimetable
Admin --> ViewTimetable
Admin --> ExportTimetable

GenerateTimetable --> SchedulerEngine
SchedulerEngine --> ConflictDetection
SchedulerEngine --> SlotAssignment

ViewTimetable --> FilterByClass
ViewTimetable --> FilterByTeacher
ViewTimetable --> FilterByRoom
```
