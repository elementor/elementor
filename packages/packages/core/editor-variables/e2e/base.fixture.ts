import { setDefaultTemplate } from 'playwright';
import { type Page, test } from '@playwright/test';
import { openVariableManager } from './utils';

export const variablesManagerFixture = test.extend< {
    openVariableManager: Page;
} >( {
    openVariableManager: async ( { page }, use ) => {
        await setDefaultTemplate( page );
        await openVariableManager( page );
        await use( page );
    },
} );
