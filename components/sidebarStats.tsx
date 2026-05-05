// components/Stats.tsx
import React from 'react';

type StatsProps = {
  title: string;
  value: string | number;
  change: string;
  isIncrease: boolean;
};

const Stats: React.FC<StatsProps> = ({ title, value, change, isIncrease }) => {
  return (
    <div className="flex flex-col items-center rounded-md bg-white p-2 shadow-md dark:bg-gray-900 max-sm:hidden lg:w-[150px]">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
      <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</span>
      <span className={`text-sm ${isIncrease ? 'text-green-500' : 'text-red-500'}`}>
        {isIncrease ? '↑' : '↓'} {change}%
      </span>
    </div>
  );
};

export default Stats;
