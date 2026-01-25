import { type ControlComponent, DisplayConditionsControl } from '@elementor/editor-controls';

import { controlsRegistry } from '../../controls-registry/controls-registry';
import { injectIntoStyleTab } from '../style-tab';
import { CustomCssSection } from './custom-css';

export const init = () => {
	//Todo: Remove when v3.37 will released
	if ( ! window.elementorPro ) {
		injectIntoStyleTab( {
			id: 'custom-css',
			component: CustomCssSection,
			options: { overwrite: true },
		} );

		controlsRegistry.register(
			'display-conditions',
			DisplayConditionsControl as unknown as ControlComponent,
			'two-columns'
		);
	}
};
