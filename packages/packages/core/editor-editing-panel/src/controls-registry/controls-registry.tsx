import {
	type ControlComponent,
	ImageControl,
	KeyValueControl,
	LinkControl,
	RepeatableControl,
	SelectControl,
	SizeControl,
	SvgMediaControl,
	SwitchControl,
	TextAreaControl,
	TextControl,
	UrlControl,
} from '@elementor/editor-controls';
import { type ControlLayout } from '@elementor/editor-elements';
import {
	booleanPropTypeUtil,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	keyValuePropTypeUtil,
	linkPropTypeUtil,
	type PropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';

import { ControlTypeAlreadyRegisteredError, ControlTypeNotRegisteredError } from '../errors';

type ControlRegistry = Record<
	string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ component: ControlComponent; layout: ControlLayout; propTypeUtil?: PropTypeUtil< string, any > }
>;

const controlTypes = {
	image: { component: ImageControl, layout: 'full', propTypeUtil: imagePropTypeUtil },
	'svg-media': { component: SvgMediaControl, layout: 'full', propTypeUtil: imageSrcPropTypeUtil },
	text: { component: TextControl, layout: 'full', propTypeUtil: stringPropTypeUtil },
	textarea: { component: TextAreaControl, layout: 'full', propTypeUtil: stringPropTypeUtil },
	size: { component: SizeControl, layout: 'two-columns', propTypeUtil: sizePropTypeUtil },
	select: { component: SelectControl, layout: 'two-columns', propTypeUtil: stringPropTypeUtil },
	link: { component: LinkControl, layout: 'custom', propTypeUtil: linkPropTypeUtil },
	url: { component: UrlControl, layout: 'full', propTypeUtil: stringPropTypeUtil },
	switch: { component: SwitchControl, layout: 'two-columns', propTypeUtil: booleanPropTypeUtil },
	repeatable: { component: RepeatableControl, layout: 'full', propTypeUtil: undefined },
	'key-value': { component: KeyValueControl, layout: 'full', propTypeUtil: keyValuePropTypeUtil },
} as const satisfies ControlRegistry;

export type ControlType = keyof typeof controlTypes;

export type ControlTypes = {
	[ key in ControlType ]: ( typeof controlTypes )[ key ][ 'component' ];
};

class ControlsRegistry {
	private static instance: ControlsRegistry;

	private constructor( private readonly controlsRegistry: ControlRegistry = controlTypes ) {
		this.controlsRegistry = controlsRegistry;
	}

	static getInstance(): ControlsRegistry {
		if ( ! ControlsRegistry.instance ) {
			ControlsRegistry.instance = new ControlsRegistry();
		}
		return ControlsRegistry.instance;
	}

	getControl( type: ControlType ) {
		return this.controlsRegistry[ type ]?.component;
	}

	getDefaultLayout( type: ControlType ) {
		return this.controlsRegistry[ type ].layout;
	}

	getPropTypeUtil( type: ControlType ) {
		return this.controlsRegistry[ type ]?.propTypeUtil;
	}

	getControlTypes() {
		return this.controlsRegistry;
	}

	registerControl(
		type: string,
		component: ControlComponent,
		layout: ControlLayout,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		propTypeUtil?: PropTypeUtil< string, any >
	) {
		if ( this.controlsRegistry[ type ] ) {
			throw new ControlTypeAlreadyRegisteredError( { context: { controlType: type } } );
		}
		this.controlsRegistry[ type ] = { component, layout, propTypeUtil };
	}

	unregisterControl( type: string ) {
		if ( ! this.controlsRegistry[ type ] ) {
			throw new ControlTypeNotRegisteredError( { context: { controlType: type } } );
		}
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete this.controlsRegistry[ type ];
	}
}

export const controlsRegistry = ControlsRegistry.getInstance();
