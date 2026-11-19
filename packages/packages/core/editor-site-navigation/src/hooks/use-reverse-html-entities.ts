import { useMemo } from 'react';

import { getPostTitlePlain } from '../utils/post-title-plain';

export function useReverseHtmlEntities( escapedHTML = '' ) {
	return useMemo( () => getPostTitlePlain( escapedHTML ), [ escapedHTML ] );
}
