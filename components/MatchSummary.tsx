'use client';

import { MatchSummaryPage } from './summary/MatchSummaryPage';

export function MatchSummary({ isViewer = false }: { isViewer?: boolean }) {
  return <MatchSummaryPage isViewer={isViewer} />;
}
