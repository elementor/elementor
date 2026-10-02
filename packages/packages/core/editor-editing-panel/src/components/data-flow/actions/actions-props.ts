import { type ActionItemPropValue } from '@elementor/editor-elements';

export type ActionArgValue = string | number | boolean | string[];

export type EventAction = {
	on: string;
	key?: string;
	do: string;
	args: Record< string, ActionArgValue >;
};

export type StateWrite = {
	from: string;
	map?: [ number, number, number, number ];
	clamp?: boolean;
	smooth?: number;
	spring?: { stiffness?: number; damping?: number; mass?: number };
	decay?: number;
	round?: number;
};

export type InputAction = {
	input: string;
	space?: string;
	inertia?: number;
	reducedMotion?: string;
	write: Record< string, StateWrite >;
};

export type PlainAction = EventAction | InputAction;

export type ArgPropType = {
	kind: string;
	key?: string;
	settings?: { enum?: string[]; required?: boolean };
	meta?: { label?: string };
	prop_types?: Record< string, ArgPropType >;
};

type PropValue = { $$type: string; value: unknown };

const RANGE_FIELDS = [ 'in_min', 'in_max', 'out_min', 'out_max' ] as const;
const SPRING_FIELDS = [ 'stiffness', 'damping', 'mass' ] as const;
const NUMBER_WRITE_FIELDS = [ 'smooth', 'decay', 'round' ] as const;

export const isInputAction = ( action: PlainAction ): action is InputAction => 'input' in action;

const prop = ( $$type: string, value: unknown ): PropValue => ( { $$type, value } );

const unwrap = ( value: unknown ): unknown => {
	if ( Array.isArray( value ) ) {
		return value.map( unwrap );
	}

	if ( value && typeof value === 'object' ) {
		if ( '$$type' in value ) {
			return unwrap( ( value as PropValue ).value );
		}

		return Object.fromEntries( Object.entries( value ).map( ( [ key, item ] ) => [ key, unwrap( item ) ] ) );
	}

	return value;
};

const compact = < T extends Record< string, unknown > >( value: T ): T =>
	Object.fromEntries( Object.entries( value ).filter( ( [ , item ] ) => item !== undefined ) ) as T;

const argTypeOf = ( value: ActionArgValue ): string => {
	if ( Array.isArray( value ) ) {
		return 'string-array';
	}

	return typeof value === 'boolean' ? 'boolean' : typeof value;
};

export function argToProp( value: ActionArgValue, schema?: ArgPropType ): PropValue {
	const type = schema?.kind === 'union' || ! schema?.key ? argTypeOf( value ) : schema.key;

	if ( 'string-array' === type ) {
		return prop(
			type,
			( Array.isArray( value ) ? value : [ value ] ).map( ( item ) => prop( 'string', String( item ) ) )
		);
	}

	return prop( type, value );
}

function eventToProp( action: EventAction, argsSchema: Record< string, ArgPropType > ): ActionItemPropValue {
	const args = Object.fromEntries(
		Object.entries( action.args ?? {} ).map( ( [ key, value ] ) => [ key, argToProp( value, argsSchema[ key ] ) ] )
	);

	return {
		$$type: 'event-action',
		value: compact( {
			on: prop( 'string', action.on ),
			key: action.key ? prop( 'string', action.key ) : undefined,
			action: prop( 'action-call', {
				name: prop( 'string', action.do ),
				args: prop( 'action-args', args ),
			} ),
		} ),
	};
}

function writeToProp( key: string, write: StateWrite ): PropValue {
	const numbers = Object.fromEntries(
		NUMBER_WRITE_FIELDS.filter( ( field ) => typeof write[ field ] === 'number' ).map( ( field ) => [
			field,
			prop( 'number', write[ field ] ),
		] )
	);

	return prop(
		'state-write',
		compact( {
			key: prop( 'string', key ),
			from: prop( 'string', write.from ),
			map: write.map
				? prop(
						'range-map',
						Object.fromEntries(
							RANGE_FIELDS.map( ( field, index ) => [
								field,
								prop( 'number', write.map?.[ index ] ?? 0 ),
							] )
						)
				  )
				: undefined,
			clamp: typeof write.clamp === 'boolean' ? prop( 'boolean', write.clamp ) : undefined,
			...numbers,
			spring: write.spring
				? prop(
						'spring',
						Object.fromEntries(
							SPRING_FIELDS.filter( ( field ) => typeof write.spring?.[ field ] === 'number' ).map(
								( field ) => [ field, prop( 'number', write.spring?.[ field ] ) ]
							)
						)
				  )
				: undefined,
		} )
	);
}

function inputToProp( action: InputAction ): ActionItemPropValue {
	return {
		$$type: 'input-action',
		value: compact( {
			input: prop( 'string', action.input ),
			space: action.space ? prop( 'string', action.space ) : undefined,
			inertia: typeof action.inertia === 'number' ? prop( 'number', action.inertia ) : undefined,
			reduced_motion: action.reducedMotion ? prop( 'string', action.reducedMotion ) : undefined,
			write: prop(
				'state-writes',
				Object.entries( action.write ).map( ( [ key, write ] ) => writeToProp( key, write ) )
			),
		} ),
	};
}

export function actionsToProps(
	actions: PlainAction[],
	getArgsSchema: ( name: string ) => Record< string, ArgPropType >
): ActionItemPropValue[] {
	return actions.map( ( action ) =>
		isInputAction( action ) ? inputToProp( action ) : eventToProp( action, getArgsSchema( action.do ) )
	);
}

function propToEvent( value: Record< string, unknown > ): EventAction {
	const action = ( value.action ?? {} ) as { name?: string; args?: EventAction[ 'args' ] };

	return compact( {
		on: value.on as string,
		key: value.key as string | undefined,
		do: action.name ?? '',
		args: action.args ?? {},
	} );
}

function propToInput( value: Record< string, unknown > ): InputAction {
	const writes = ( value.write ?? [] ) as Array<
		Omit< StateWrite, 'map' > & { key: string; map?: Record< ( typeof RANGE_FIELDS )[ number ], number > }
	>;

	return compact( {
		input: value.input as string,
		space: value.space as string | undefined,
		inertia: value.inertia as number | undefined,
		reducedMotion: value.reduced_motion as string | undefined,
		write: Object.fromEntries(
			writes.map( ( { key, map, ...write } ) => [
				key,
				compact( {
					...write,
					map: map
						? ( RANGE_FIELDS.map( ( field ) => map[ field ] ?? 0 ) as StateWrite[ 'map' ] )
						: undefined,
				} ),
			] )
		),
	} );
}

export function propsToActions( items: ActionItemPropValue[] ): PlainAction[] {
	return items.map( ( item ) => {
		const value = unwrap( item.value ) as Record< string, unknown >;

		return 'input-action' === item.$$type ? propToInput( value ) : propToEvent( value );
	} );
}
