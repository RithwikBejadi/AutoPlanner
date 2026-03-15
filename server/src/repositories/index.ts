
export type { ISubjectRepository } from './interfaces/ISubjectRepository.js';
export type { IRoomRepository } from './interfaces/IRoomRepository.js';
export type { ITimeSlotRepository } from './interfaces/ITimeSlotRepository.js';
export type { IClassGroupRepository } from './interfaces/IClassGroupRepository.js';
export type { ITeacherRepository } from './interfaces/ITeacherRepository.js';
export type { ITimetableRepository } from './interfaces/ITimetableRepository.js';


export { PrismaSubjectRepository } from './implementations/PrismaSubjectRepository.js';
export { PrismaRoomRepository } from './implementations/PrismaRoomRepository.js';
export { PrismaTimeSlotRepository } from './implementations/PrismaTimeSlotRepository.js';
export { PrismaClassGroupRepository } from './implementations/PrismaClassGroupRepository.js';
export { PrismaTeacherRepository } from './implementations/PrismaTeacherRepository.js';
export { PrismaTimetableRepository } from './implementations/PrismaTimetableRepository.js';

