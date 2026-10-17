import {
	type ElementStateParam,
	type ElementStatePropType,
	type ElementStateScope,
	getElementStateScopes,
} from '@elementor/editor-elements';
import { isTransformable } from '@elementor/editor-props';

export const STATE_TAG_NAME = 'e-state';
export const STATE_IMAGE_TAG_NAME = 'e-state-image';
export const STATE_TAG_GROUP = 'element-state';
export const STATE_OPTION_PREFIX = 'element-state::';

export const isStateTagName = ( name: string ) => [ STATE_TAG_NAME, STATE_IMAGE_TAG_NAME ].includes( name );

type StateTagSettings = Record< string, unknown > | undefined;

export type StateTagOption = {
	label: string;
	value: string;
	group: typeof STATE_TAG_GROUP;
	key: string;
	scope: string;
	tagName: typeof STATE_TAG_NAME | typeof STATE_IMAGE_TAG_NAME;
};

export type StateTagGroup = {
	id: string;
	label: string;
	options: StateTagOption[];
};

const CATEGORIES_BY_PROP_TYPE: Partial< Record< ElementStatePropType, string[] > > = {
	string: [ 'text', 'url' ],
	enum: [ 'text', 'url' ],
	number: [ 'number' ],
	color: [ 'color' ],
	image: [ 'image' ],
};

const readSetting = ( settings: StateTagSettings, name: string ) => {
	const setting = settings?.[ name ];

	return String( ( isTransformable( setting ) ? setting.value : setting ) ?? '' );
};

const toStateOptionValue = ( scope: string, key: string ) => `${ STATE_OPTION_PREFIX }${ scope }::${ key }`;

export const isStateOptionValue = ( value: string ) => value.startsWith( STATE_OPTION_PREFIX );

export const getStateTagGroups = ( elementId: string, acceptedCategories: string[] ): StateTagGroup[] =>
	getElementStateScopes( elementId )
		.map( ( scope ) => toStateTagGroup( scope, acceptedCategories ) )
		.filter( ( group ) => group.options.length );

export const createStateTagValue = ( option: StateTagOption ) => ( {
	name: option.tagName,
	group: STATE_TAG_GROUP,
	settings: {
		key: { $$type: 'string', value: option.key },
		scope: { $$type: 'string', value: option.scope },
		label: option.label,
	},
} );

export const getStateTagLabel = ( settings: StateTagSettings ) => readSetting( settings, 'label' );

export const toStatePlaceholder = ( settings: StateTagSettings, pathSuffix = '' ) => {
	const format = readSetting( settings, 'format' );
	const formatSuffix = format && format !== 'raw' ? `|${ format }` : '';
	const scope = readSetting( settings, 'scope' );
	const scopeSelector = scope ? `@${ scope }` : '';

	return `${ readSetting( settings, 'prefix' ) }{{state${ scopeSelector }.${ readSetting(
		settings,
		'key'
	) }${ pathSuffix }${ formatSuffix }}}${ readSetting( settings, 'suffix' ) }`;
};

const toStateTagGroup = ( scope: ElementStateScope, acceptedCategories: string[] ): StateTagGroup => ( {
	id: `${ STATE_TAG_GROUP }::${ scope.elementId }`,
	label: scope.label,
	options: scope.params
		.filter( ( param ) => isCompatible( param, acceptedCategories ) )
		.map( ( param ) => toStateTagOption( scope.elementId, param ) ),
} );

const toStateTagOption = ( scope: string, param: ElementStateParam ): StateTagOption => ( {
	label: param.exposed?.label || param.label || param.key,
	value: toStateOptionValue( scope, param.key ),
	group: STATE_TAG_GROUP,
	key: param.key,
	scope,
	tagName: ( param.prop_type ?? param.type ) === 'image' ? STATE_IMAGE_TAG_NAME : STATE_TAG_NAME,
} );

const isCompatible = ( param: ElementStateParam, acceptedCategories: string[] ) => {
	const propType = param.prop_type ?? param.type;

	return (
		CATEGORIES_BY_PROP_TYPE[ propType ]?.some( ( category ) => acceptedCategories.includes( category ) ) ?? false
	);
};
