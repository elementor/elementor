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
	link: { component: LinkControl, layout: 'full', propTypeUtil: linkPropTypeUtil },
	url: { component: UrlControl, layout: 'full', propTypeUtil: stringPropTypeUtil },
	switch: { component: SwitchControl, layout: 'two-columns', propTypeUtil: booleanPropTypeUtil },
	repeatable: { component: RepeatableControl, layout: 'full', propTypeUtil: undefined },
	'key-value': { component: KeyValueControl, layout: 'full', propTypeUtil: keyValuePropTypeUtil },
} as const satisfies ControlRegistry;

export type ControlType = keyof typeof controlTypes;

export type ControlTypes = {
	[ key in ControlType ]: ( typeof controlTypes )[ key ][ 'component' ];
};

export const getControl = ( type: ControlType ) => controlTypes[ type ]?.component;

export const getDefaultLayout = ( type: ControlType ) => controlTypes[ type ].layout;

export const getPropTypeUtil = ( type: ControlType ) => controlTypes[ type ]?.propTypeUtil;
