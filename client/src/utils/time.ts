import { TimeOptions } from "../types";

export function getTimeRangeFromOptions(timeOption: TimeOptions | string) {
  const now = new Date();
  let startTime: number | Date, endTime: number | Date;
  switch (timeOption) {
    case TimeOptions.today:
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case TimeOptions.thisWeek:
      const dayOfWeek = now.getDay(); // 2  - 20 -2 (18) - 20 + 4
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek), 23, 59, 59, 999);
      break;
    case TimeOptions.thisMonth:
      startTime = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case TimeOptions.thisYear:
      startTime = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      throw new Error('Invalid time range option');
  }
  return { startTime, endTime }
}