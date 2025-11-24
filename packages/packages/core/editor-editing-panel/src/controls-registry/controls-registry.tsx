import {
	type ControlComponent,
	DateTimeControl,
	HtmlTagControl,
	ImageControl,
	InlineEditingControl,
	KeyValueControl,
	LinkControl,
	NumberControl,
	QueryControl,
	RepeatableControl,
	SelectControlWrapper,
	SizeControl,
	SvgMediaControl,
	SwitchControl,
	TextAreaControl,
	TextControl,
	ToggleControl,
	UrlControl,
} from '@elementor/editor-controls';
import { type ControlLayout } from '@elementor/editor-elements';
import {
	booleanPropTypeUtil,
	DateTimePropTypeUtil,
	htmlPropTypeUtil,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	keyValuePropTypeUtil,
	linkPropTypeUtil,
	numberPropTypeUtil,
	type PropTypeUtil,
	queryPropTypeUtil,
	sizePropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';

import { ControlTypeAlreadyRegisteredError, ControlTypeNotRegisteredError } from '../errors';

export type ControlRegistry = Record<
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
	select: { component: SelectControlWrapper, layout: 'two-columns', propTypeUtil: stringPropTypeUtil },
	link: { component: LinkControl, layout: 'custom', propTypeUtil: linkPropTypeUtil },
	query: { component: QueryControl, layout: 'full', propTypeUtil: queryPropTypeUtil },
	url: { component: UrlControl, layout: 'full', propTypeUtil: stringPropTypeUtil },
	switch: { component: SwitchControl, layout: 'two-columns', propTypeUtil: booleanPropTypeUtil },
	number: { component: NumberControl, layout: 'two-columns', propTypeUtil: numberPropTypeUtil },
	repeatable: { component: RepeatableControl, layout: 'full', propTypeUtil: undefined },
	'key-value': { component: KeyValueControl, layout: 'full', propTypeUtil: keyValuePropTypeUtil },
	'html-tag': { component: HtmlTagControl, layout: 'two-columns', propTypeUtil: stringPropTypeUtil },
	toggle: { component: ToggleControl, layout: 'full', propTypeUtil: stringPropTypeUtil },
	'date-time': { component: DateTimeControl, layout: 'full', propTypeUtil: DateTimePropTypeUtil },
	'inline-editing': { component: InlineEditingControl, layout: 'full', propTypeUtil: htmlPropTypeUtil },
} as const satisfies ControlRegistry;

export type ControlType = keyof typeof controlTypes;

export type ControlTypes = {
	[ key in ControlType ]: ( typeof controlTypes )[ key ][ 'component' ];
};

class ControlsRegistry {
	constructor( private readonly controlsRegistry: ControlRegistry ) {
		this.controlsRegistry = controlsRegistry;
	}

	get( type: ControlType ): ControlComponent {
		return this.controlsRegistry[ type ]?.component;
	}

	getLayout( type: ControlType ) {
		return this.controlsRegistry[ type ]?.layout;
	}

	getPropTypeUtil( type: ControlType ) {
		return this.controlsRegistry[ type ]?.propTypeUtil;
	}

	registry(): ControlRegistry {
		return this.controlsRegistry;
	}

	register(
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

	unregister( type: string ) {
		if ( ! this.controlsRegistry[ type ] ) {
			throw new ControlTypeNotRegisteredError( { context: { controlType: type } } );
		}
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete this.controlsRegistry[ type ];
	}
}

export const controlsRegistry = new ControlsRegistry( controlTypes );
