import { type ComponentType } from 'react';

const DEFAULT_PRIORITY = 10;
const DEFAULT_POSITION = 'after';
const WILDCARD_ELEMENT_TYPE = '*';

type InjectionPosition = 'before' | 'after';

type SectionInjection = {
	id: string;
	elementTypes: string[];
	component: ComponentType;
	priority: number;
	position: InjectionPosition;
};

type RegistryArgs = {
	id: string;
	elementType: string | string[];
	sectionId: string;
	component: ComponentType;
	options?: {
		priority?: number;
		overwrite?: boolean;
		position?: InjectionPosition;
	};
};

export type SettingsSectionInjectionArgs = RegistryArgs;
export type StyleSectionInjectionArgs = Omit< RegistryArgs, 'sectionId' > & { sectionName: string };

type StyleControlInjection = {
	id: string;
	elementTypes: string[];
	component: ComponentType;
	priority: number;
	controlIds: string[];
	sectionName: string;
};

export type StyleControlInjectionArgs = {
	id: string;
	elementType: string | string[];
	sectionName: string;
	afterControl: string | string[];
	component: ComponentType;
	options?: {
		priority?: number;
		overwrite?: boolean;
	};
};

const settingsSectionInjections = new Map< string, Map< string, SectionInjection > >();
const styleSectionInjections = new Map< string, Map< string, SectionInjection > >();
const styleControlInjections = new Map< string, StyleControlInjection >();

function normalizeElementTypes( elementType: string | string[] ): string[] {
	return Array.isArray( elementType ) ? elementType : [ elementType ];
}

function addInjection(
	registry: Map< string, Map< string, SectionInjection > >,
	sectionKey: string,
	{ id, elementType, component, options = {} }: Omit< RegistryArgs, 'sectionId' >
) {
	const bucket = registry.get( sectionKey ) ?? new Map< string, SectionInjection >();

	if ( bucket.has( id ) && ! options.overwrite ) {
		// eslint-disable-next-line no-console
		console.warn(
			`A section injection with the id "${ id }" already exists. Did you mean to use "options.overwrite"?`
		);
		return;
	}

	bucket.set( id, {
		id,
		elementTypes: normalizeElementTypes( elementType ),
		component,
		priority: options.priority ?? DEFAULT_PRIORITY,
		position: options.position ?? DEFAULT_POSITION,
	} );

	registry.set( sectionKey, bucket );
}

export function injectIntoSettingsSection( args: SettingsSectionInjectionArgs ) {
	const { sectionId, ...rest } = args;
	addInjection( settingsSectionInjections, sectionId, rest );
}

export function injectIntoStyleSection( args: StyleSectionInjectionArgs ) {
	const { sectionName, ...rest } = args;
	addInjection( styleSectionInjections, sectionName, rest );
}

function getMatching(
	registry: Map< string, Map< string, SectionInjection > >,
	sectionKey: string,
	elementType: string
): SectionInjection[] {
	const bucket = registry.get( sectionKey );

	if ( ! bucket ) {
		return [];
	}

	return [ ...bucket.values() ]
		.filter(
			( entry ) =>
				entry.elementTypes.includes( WILDCARD_ELEMENT_TYPE ) || entry.elementTypes.includes( elementType )
		)
		.sort( ( a, b ) => a.priority - b.priority );
}

export function getSettingsSectionInjections(
	elementType: string,
	sectionId: string,
	position?: InjectionPosition
): SectionInjection[] {
	const all = getMatching( settingsSectionInjections, sectionId, elementType );

	if ( ! position ) {
		return all;
	}

	return all.filter( ( entry ) => entry.position === position );
}

export function getStyleSectionInjections( elementType: string, sectionName: string ): SectionInjection[] {
	return getMatching( styleSectionInjections, sectionName, elementType );
}

export function injectAfterStyleControl( args: StyleControlInjectionArgs ) {
	const { id, elementType, sectionName, afterControl, component, options = {} } = args;

	if ( styleControlInjections.has( id ) && ! options.overwrite ) {
		// eslint-disable-next-line no-console
		console.warn(
			`A style control injection with the id "${ id }" already exists. Did you mean to use "options.overwrite"?`
		);
		return;
	}

	styleControlInjections.set( id, {
		id,
		elementTypes: normalizeElementTypes( elementType ),
		component,
		priority: options.priority ?? DEFAULT_PRIORITY,
		controlIds: Array.isArray( afterControl ) ? afterControl : [ afterControl ],
		sectionName,
	} );
}

export function getStyleControlInjections(
	elementType: string,
	sectionName: string,
	controlId: string
): StyleControlInjection[] {
	return [ ...styleControlInjections.values() ]
		.filter(
			( entry ) =>
				entry.sectionName === sectionName &&
				entry.controlIds.includes( controlId ) &&
				( entry.elementTypes.includes( WILDCARD_ELEMENT_TYPE ) || entry.elementTypes.includes( elementType ) )
		)
		.sort( ( a, b ) => a.priority - b.priority );
}

export function flushSectionInjections() {
	settingsSectionInjections.clear();
	styleSectionInjections.clear();
	styleControlInjections.clear();
}
