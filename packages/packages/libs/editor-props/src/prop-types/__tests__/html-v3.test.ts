import { htmlV3PropTypeUtil } from '../html-v3';
import { stringPropTypeUtil } from '../string';

describe( 'htmlV3PropTypeUtil', () => {
	it( 'should accept persisted values without children', () => {
		const prop = {
			$$type: 'html-v3',
			value: {
				content: stringPropTypeUtil.create( 'Hello world' ),
			},
		};

		expect( htmlV3PropTypeUtil.isValid( prop ) ).toBe( true );
		expect( htmlV3PropTypeUtil.extract( prop ) ).toEqual( {
			content: stringPropTypeUtil.create( 'Hello world' ),
			children: [],
		} );
	} );
} );
