import { __useSelector as useSelector } from '@elementor/store';

import { selectTemplates } from './store';

export function useLoadedTemplates() {
	return useSelector( selectTemplates );
}
