import { type PropKey, type PropType, type PropTypeKey, type TransformablePropValue } from '../types';
import { type JsonSchema7 } from '../utils/prop-json-schema';

type PropValue = TransformablePropValue< PropKey, unknown >;
interface AnyValue extends PropValue {
	[ k: string ]: unknown;
}

export type LlmDialectSchemaContext = {
	allowBindTo?: boolean;
};

export type LlmDialectValueContext = {
	propType?: PropType;
};

export type DialectSchemaAdapter = {
	id: string;
	matches: ( propType: PropType ) => boolean;
	toDialectSchema: ( current: JsonSchema7, propType: PropType, context?: LlmDialectSchemaContext ) => JsonSchema7;
};

export type DialectValueAdapter< T = AnyValue > = {
	toPropValue: ( value: T ) => PropValue;
	toDialectValue: ( value: PropValue, context?: LlmDialectValueContext ) => T;
};

export interface DialectPropAdapter< T = AnyValue > extends DialectValueAdapter< T > {
	toDialectSchema: DialectSchemaAdapter[ 'toDialectSchema' ];
}

const createValueAdapterChain = () => {
	const chain = new Set< DialectValueAdapter >();
	const register = ( adapter: DialectValueAdapter ) => {
		chain.add( adapter );
	};
	const toPropValue = ( value: AnyValue ): AnyValue => {
		return [ ...chain ].reduce( ( payload, adapter ) => adapter.toPropValue( payload ), value );
	};
	const toDialectValue = ( value: PropValue, context?: LlmDialectValueContext ) => {
		return [ ...chain ].reduce(
			( payload, adapter ) => adapter.toDialectValue( payload, context ) || payload,
			value
		);
	};

	return {
		register,
		toPropValue,
		toDialectValue,
	};
};

const valueAdaptersRegistry: Map< string, ReturnType< typeof createValueAdapterChain > > = new Map();
const globalValueAdapter = createValueAdapterChain();
const schemaDialectAdapters: DialectSchemaAdapter[] = [];
const schemaDialectAdapterIds = new Set< string >();
let schemaCleanup: ( ( schema: JsonSchema7 ) => JsonSchema7 ) | null = null;

class LLMDialectAdapterClass {
	registerSchemaDialect( adapter: DialectSchemaAdapter ) {
		if ( schemaDialectAdapterIds.has( adapter.id ) ) {
			throw new Error( `Duplicate LLM schema dialect registration: "${ adapter.id }".` );
		}

		schemaDialectAdapterIds.add( adapter.id );
		schemaDialectAdapters.push( adapter );
	}

	registerSchemaCleanup( cleanup: ( schema: JsonSchema7 ) => JsonSchema7 ) {
		if ( schemaCleanup ) {
			throw new Error( 'Duplicate LLM schema cleanup registration.' );
		}

		schemaCleanup = cleanup;
	}

	register( key: PropTypeKey, adapter: DialectValueAdapter ) {
		if ( ! valueAdaptersRegistry.has( key ) ) {
			valueAdaptersRegistry.set( key, createValueAdapterChain() );
		}
		valueAdaptersRegistry.get( key )?.register( adapter );
	}

	registerGlobalValueAdapter( adapter: DialectValueAdapter ) {
		globalValueAdapter.register( adapter );
	}

	toDialectSchema( currentSchema: JsonSchema7, propType: PropType, context?: LlmDialectSchemaContext ) {
		const dialectSchema = schemaDialectAdapters
			.filter( ( { matches } ) => matches( propType ) )
			.reduce( ( payload, { toDialectSchema } ) => toDialectSchema( payload, propType, context ), currentSchema );

		return schemaCleanup ? schemaCleanup( dialectSchema ) : dialectSchema;
	}

	toPropValue( value: unknown ): PropValue {
		if ( typeof value !== 'object' || value === null || typeof ( value as AnyValue ).$$type !== 'string' ) {
			return value as PropValue;
		}
		let result = globalValueAdapter.toPropValue( value as AnyValue );
		const adapter = valueAdaptersRegistry.get( result.$$type );
		if ( adapter ) {
			result = adapter.toPropValue( result );
		}
		return result as PropValue;
	}

	toDialectValue( value: PropValue, context?: LlmDialectValueContext ) {
		if ( typeof value !== 'object' || value === null || typeof value.$$type !== 'string' ) {
			return value as AnyValue;
		}
		let result = globalValueAdapter.toDialectValue( value, context );
		const adapter = valueAdaptersRegistry.get( value.$$type );
		if ( adapter ) {
			result = adapter.toDialectValue( result, context ) || result;
		}
		return result as AnyValue;
	}
}

export const LLMDialectAdapter = new LLMDialectAdapterClass();
