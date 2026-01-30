import type { QAData } from '../../types';

export function hasRelatedQAForTerm(termName: string, assignedMap: Record<string, Set<string>> | Record<string,any>, unitId: string, qaData: QAData | Record<string, any>, RELATED_QA_FUZZY: boolean): boolean;
