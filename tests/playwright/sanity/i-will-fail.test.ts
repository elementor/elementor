import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';

test( 'Failing test', () => {
	expect( false ).toBe( true );
} );
