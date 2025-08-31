import { expect } from '@playwright/test';

import { variablesManagerFixture } from './base.fixture';

variablesManagerFixture( 'Variable Manager', async ( { page, openVariableManager } ) => {
	expect( openVariableManager ).toBeDefined();
} );
