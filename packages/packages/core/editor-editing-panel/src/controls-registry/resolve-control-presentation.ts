import { type ControlLayout } from '@elementor/editor-elements';

import { populateChildControlProps } from './control-layout';
import { controlsRegistry, type ControlType } from './controls-registry';

type ControlPresentationInput = {
	type: string;
	label?: string;
	props?: Record< string, unknown >;
	meta?: {
		layout?: ControlLayout;
		topDivider?: boolean;
	};
};

export function resolveControlPresentation( {
	type,
	label,
	props = {},
	meta,
}: ControlPresentationInput ) {
	if ( ! controlsRegistry.get( type as ControlType ) ) {
		return null;
	}

	const layout = meta?.layout ?? controlsRegistry.getLayout( type as ControlType );
	const controlProps = populateChildControlProps( { ...props } );

	if ( layout === 'custom' ) {
		controlProps.label = label;
	}

	return { layout, controlProps };
}
