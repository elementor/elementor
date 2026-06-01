import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { useViolationFocus } from '../use-violation-focus';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateOpenRoute: jest.fn(),
	__privateRunCommand: jest.fn(),
} ) );

describe( 'useViolationFocus', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should open the page settings route for page settings violations', () => {
		// Arrange.
		const { focus } = useViolationFocus();

		// Act.
		focus( {
			auditId: 'audits/missing-featured-image',
			label: 'No featured image set.',
			targetHint: 'page-settings',
		} );

		// Assert.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/page-settings/settings' );
		expect( runCommand ).not.toHaveBeenCalled();
	} );
} );
