# AutoPlan — Smart Timetable Generator

## Problem
Educational institutes struggle to manually create timetables while handling:
- teacher availability
- room capacity
- subject requirements
- clashes between courses
- limited time slots

Manual scheduling is slow, error-prone, and hard to optimize.

## Solution
AutoPlan is a full-stack web application that automatically generates optimized academic timetables based on constraints provided by the administrator.

The system uses rule-based scheduling logic to assign subjects to time slots, rooms, and teachers while avoiding conflicts.

## Scope
The system will allow:
- Admin to add teachers, rooms, subjects, and classes
- Define constraints (availability, capacity, hours/week)
- Generate timetable automatically
- View timetable by class / teacher / room
- Regenerate timetable if conflicts appear
- Export timetable

## Key Features
- Constraint-based timetable generation
- Conflict detection engine
- Modular scheduling service
- Timetable versioning
- Dashboard for viewing schedules

## Tech Direction
Backend: Architecture with service layers  
Frontend: Dashboard interface for schedule management  
Database: relational schema for timetable entities
