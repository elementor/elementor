import { AttributesControl, DisplayConditionsControl } from '@elementor/editor-controls';

import { controlsRegistry } from '../../controls-registry/controls-registry';
import { injectIntoStyleTab } from '../style-tab';
import { CustomCssSection } from './custom-css';

export const init = () => {
	injectIntoStyleTab( {
		id: 'custom-css',
		component: CustomCssSection,
		options: { overwrite: true },
	} );

	if ( ! window.elementorPro ) {
		controlsRegistry.register( 'attributes', AttributesControl, 'two-columns' );

		controlsRegistry.register( 'display-conditions', DisplayConditionsControl, 'two-columns' );
	}
};
