import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';

test( 'Dummy test file to trigger the CI', async ( ) => {
	const a = true;
	expect( a ).toBeTruthy();
} );
