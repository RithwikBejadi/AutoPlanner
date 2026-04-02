export const exportToCSV = (schedule, subjects, classGroups, rooms, teachers) => {
  const headers = ['Time', 'Day', 'Subject', 'Class', 'Room', 'Teacher'];
  const rows = schedule.map(entry => {
    return [
      `${entry.timeSlot.startTime}-${entry.timeSlot.endTime}`,
      entry.timeSlot.day,
      entry.subject.name,
      entry.classGroup.name,
      entry.room.name,
      entry.teacher.name
    ].map(v => `"${v}"`).join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'timetable_export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printSchedule = () => {
  window.print();
};
