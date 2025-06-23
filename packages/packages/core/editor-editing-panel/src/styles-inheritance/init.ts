import { isUsingIndicatorPopover } from './consts';
import { initStylesInheritanceTransformers } from './init-styles-inheritance-transformers';

export const init = () => {
	if ( isUsingIndicatorPopover() ) {
		initStylesInheritanceTransformers();
	}
};
