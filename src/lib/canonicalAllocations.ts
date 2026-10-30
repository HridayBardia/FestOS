// Canonical Accommodations & Allocations Dataset for FestOS
// Auto-generated from participants.csv and hostels.csv
// Ensures all beds in AccommodationView display real delegates from the canonical dataset
// Zero em dashes or en dashes

import allocationsData from './canonicalAllocations.json';
import { Participant, AccommodationAllocation, Contingent } from '@/types/database';

export const CANONICAL_ALLOCATIONS: AccommodationAllocation[] = allocationsData.allocations as unknown as AccommodationAllocation[];
export const CANONICAL_PARTICIPANTS: Participant[] = allocationsData.participants as unknown as Participant[];
export const CANONICAL_CONTINGENTS: Contingent[] = allocationsData.contingents as unknown as Contingent[];

