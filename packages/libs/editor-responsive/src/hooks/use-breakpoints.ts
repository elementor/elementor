import { __privateUseListenTo as useListenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { getBreakpoints } from '../sync/get-breakpoints';

export function useBreakpoints() {
	return useListenTo( v1ReadyEvent(), getBreakpoints );
}
