import { expect } from '@playwright/test';

import { variablesManagerFixture } from './base.fixture';

variablesManagerFixture( 'Variable Manager', async ( { openVariableManager } ) => {
	expect( openVariableManager ).toBeDefined();
} );
