import * as React from 'react';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__getStore as getStore,
	__registerSlice as registerSlice,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { ThemeProvider } from '@elementor/ui';
import { render, screen } from '@testing-library/react';

import { slice } from '../../store/slice';
import { type PageAuditReport } from '../../types';
import AuditToggleIcon from '../audit-toggle-icon';

function renderIcon() {
	const store = getStore();

	if ( ! store ) {
		throw new Error( 'Store is not initialized' );
	}

	return render(
		<ThemeProvider>
			<StoreProvider store={ store }>
				<AuditToggleIcon />
			</StoreProvider>
		</ThemeProvider>
	);
}

function makeReport(): PageAuditReport {
	return {
		documentId: 1,
		runAt: 1700000000000,
		overall: 100,
		categories: {
			'best-practices': { score: 100, failed: 0, total: 0 },
			seo: { score: 100, failed: 0, total: 0 },
			accessibility: { score: 100, failed: 0, total: 0 },
			performance: { score: 100, failed: 0, total: 0 },
			compliance: { score: 100, failed: 0, total: 0 },
		},
		auditResults: [],
	};
}

describe( 'AuditToggleIcon', () => {
	beforeEach( () => {
		registerSlice( slice );
		createStore();
	} );

	it( 'does not show the stale dot when the report is not stale', () => {
		// Act.
		renderIcon();

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( 'audit-stale-indicator' ) ).toHaveClass( 'MuiBadge-invisible' );
	} );

	it( 'shows the stale dot when the report is stale', () => {
		// Arrange.
		dispatch( slice.actions.runSucceeded( makeReport() ) );
		dispatch( slice.actions.reportStale() );

		// Act.
		renderIcon();

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( 'audit-stale-indicator' ) ).not.toHaveClass( 'MuiBadge-invisible' );
	} );
} );
