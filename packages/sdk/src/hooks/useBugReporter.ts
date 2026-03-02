import { useContext } from 'react';
import { BugReporterContext, BugReporterContextValue } from '../context/BugReporterContext';

export function useBugReporter(): BugReporterContextValue {
  const context = useContext(BugReporterContext);
  if (!context) {
    throw new Error('useBugReporter must be used within a BugReporterProvider');
  }
  return context;
}
