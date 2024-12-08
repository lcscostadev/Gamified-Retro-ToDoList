export interface Mission {
  id: string;
  description: string;
  requirement: number;
  reward: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const missions: Mission[] = [
  {
    id: 'daily5',
    description: 'Complete 5 tasks today',
    requirement: 5,
    reward: 'You unlocked a hidden message: "You\'re doing great!"',
  },
  {
    id: 'weekly20',
    description: 'Complete 20 tasks this week',
    requirement: 20,
    reward: 'You unlocked a new difficulty mode!',
  },
];

export const achievements: Achievement[] = [
  {
    id: 'taskConqueror',
    name: 'Task Conqueror',
    description: 'Complete 10 tasks in one day',
    icon: '🏆',
  },
  {
    id: 'streakHero',
    name: 'Streak Hero',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
  },
];

export const difficultyLevels = ['Easy', 'Normal', 'Hard'];

