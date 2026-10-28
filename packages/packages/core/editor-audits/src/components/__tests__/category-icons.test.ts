import { BoltIcon, ElementorAccessibilityIcon, FileSearchIcon, Settings2Icon, ShieldCheckIcon } from '@elementor/icons';

import { CATEGORY_ICONS } from '../category-icons';

describe( 'CATEGORY_ICONS', () => {
	it( 'maps each audit category to its icon component', () => {
		// Assert.
		expect( CATEGORY_ICONS[ 'best-practices' ] ).toBe( Settings2Icon );
		expect( CATEGORY_ICONS.seo ).toBe( FileSearchIcon );
		expect( CATEGORY_ICONS.accessibility ).toBe( ElementorAccessibilityIcon );
		expect( CATEGORY_ICONS.performance ).toBe( BoltIcon );
		expect( CATEGORY_ICONS.compliance ).toBe( ShieldCheckIcon );
	} );
} );
