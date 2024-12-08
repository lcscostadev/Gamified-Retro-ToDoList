import React from 'react'

interface StreakData {
  [date: string]: number;
}

interface StreakTrackerProps {
  streakData: StreakData;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ streakData }) => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const daysSinceFirstDay = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysSinceFirstDay + firstDayOfYear.getDay()) / 7);
  };

  const getColor = (tasksCompleted: number) => {
    if (tasksCompleted >= 5) return 'bg-green-300';
    if (tasksCompleted >= 3) return 'bg-green-500';
    if (tasksCompleted >= 1) return 'bg-green-700';
    return 'bg-gray-800';
  };

  const weeks: Date[][] = [];
  const currentDate = new Date(startOfYear);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from the first Monday

  while (currentDate <= endOfYear) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="bg-black p-4 rounded-lg border border-green-500 overflow-x-auto">
      <div className="flex">
        <div className="w-8 mr-2">
          {dayNames.map(day => (
            <div key={day} className="h-6 text-xs flex items-center justify-end pr-1">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="flex mb-1">
            {monthNames.map((month) => (
              <div key={month} className="flex-1 text-center text-xs">
                {month}
              </div>
            ))}
          </div>
          <div className="grid grid-flow-col gap-1">
            {weeks.map(week => (
              <div key={week[0].toISOString()} className="grid grid-rows-7 gap-1">
                {week.map((date, dayIndex) => {
                  const dateString = date.toISOString().split('T')[0];
                  const tasksCompleted = streakData[dateString] || 0;
                  const isToday = date.toDateString() === today.toDateString();
                  const isCurrentYear = date.getFullYear() === today.getFullYear();

                  return (
                    <div
                      key={dayIndex}
                      className={`w-4 h-4 ${getColor(tasksCompleted)} ${isToday ? 'ring-2 ring-yellow-400' : ''
                        } ${!isCurrentYear ? 'opacity-25' : ''} rounded-sm transition-colors duration-200 ease-in-out hover:ring-2 hover:ring-green-300`}
                      title={`${date.toDateString()}: ${tasksCompleted} tasks completed`}
                    />
                  );
                })}
              </div>
            ))}

          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-gray-700 rounded-sm" />
          <div className="w-3 h-3 bg-green-700 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <div className="w-3 h-3 bg-green-300 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default StreakTracker;

