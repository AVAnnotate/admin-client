import type { SlateCompareEventData } from '@ty/slate.ts';
import type { ProjectData } from '@ty/Types.ts';

interface EmbeddedEventComparisonProps {
  comparisonData: SlateCompareEventData;
  project: ProjectData;
}

export const EmbeddedEventComparison: React.FC<EmbeddedEventComparisonProps> = (
  props
) => {
  return <p>WIP</p>;
};
