import { mockInheritanceChainWithDisplay } from '../../__tests__/mock-inheritance-chain';
import { normalizeInheritanceItem } from '../use-normalized-inheritance-chain-items';

describe( 'normalizeInheritanceItem', () => {
	it( 'should return the correct normalized item', async () => {
		const bind = 'display';
		const index = 0;
		const mockValue = 'sameValue';
		const mockResolve = jest.fn().mockResolvedValue( { [ bind ]: mockValue } );
		const result = await normalizeInheritanceItem( mockInheritanceChainWithDisplay[ 0 ], index, bind, mockResolve );

		expect( result ).toEqual( {
			id: 'e-b7cc960-bb78ae3',
			breakpoint: 'desktop',
			displayLabel: 'local',
			provider: 'document-elements-2449',
			value: mockValue,
		} );
	} );
} );
