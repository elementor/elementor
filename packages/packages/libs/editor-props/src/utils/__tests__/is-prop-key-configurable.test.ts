import { type PropType } from '../../types';
import { isPropKeyConfigurable, isPropSensitive } from '../props-to-llm-schema';

const stringProp = ( meta: Record< string, unknown > | unknown[] = {} ) =>
	( {
		kind: 'plain',
		key: 'string',
		settings: {},
		meta,
	} ) as unknown as PropType;

describe( 'isPropSensitive', () => {
	it( 'is true for props marked as sensitive', () => {
		expect( isPropSensitive( stringProp( { sensitive: true } ) ) ).toBe( true );
	} );

	it.each( [
		[ 'no meta', stringProp() ],
		[ 'empty PHP meta serialized as an array', stringProp( [] ) ],
		[ 'not exportable only', stringProp( { export: false } ) ],
		[ 'non boolean sensitive', stringProp( { sensitive: 'yes' } ) ],
		[ 'undefined prop type', undefined ],
	] )( 'is false for %s', ( _, propType ) => {
		expect( isPropSensitive( propType ) ).toBe( false );
	} );
} );

describe( 'isPropKeyConfigurable', () => {
	it( 'rejects sensitive props', () => {
		expect( isPropKeyConfigurable( 'api_key', stringProp( { sensitive: true } ) ) ).toBe( false );
	} );

	it( 'rejects sensitive props even when marked llm_configurable', () => {
		expect( isPropKeyConfigurable( 'classes', stringProp( { sensitive: true, llm_configurable: true } ) ) ).toBe(
			false
		);
	} );

	it( 'keeps the non configurable keys semantics', () => {
		expect( isPropKeyConfigurable( 'title', stringProp() ) ).toBe( true );
		expect( isPropKeyConfigurable( 'title' ) ).toBe( true );
		expect( isPropKeyConfigurable( 'classes', stringProp() ) ).toBe( false );
		expect( isPropKeyConfigurable( 'classes', stringProp( { llm_configurable: true } ) ) ).toBe( true );
	} );
} );
