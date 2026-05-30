import { ActivityStatus } from "../../enums/activity/ActivityStatus";

export const ActivityStatusLabels: Record<ActivityStatus, string> = {
  [ActivityStatus.planned]: 'Planned',
  [ActivityStatus.reserved]: 'Reserved',
  [ActivityStatus.completed]: 'Completed',
  [ActivityStatus.cancelled]: 'Cancelled',
};