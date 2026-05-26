const EXPECTED_TRAILING_REFRESH_INVOCATIONS = 2;
const PANEL_CONTAINER = 'panel';
const PREVIEW_RELOAD_COMMAND = 'preview/reload';
const REFRESH_WIDGETS_ACTION = 'refresh_widgets_config';

jQuery( () => {
	QUnit.module( 'File: assets/dev/js/editor/editor-base.js', ( hooks ) => {
		let originalAddRequest,
			originalAddWidgetsCache,
			originalDoAction,
			originalElementsCategories,
			originalKitManager,
			originalLocale,
			originalRefreshContainer,
			originalRun,
			originalUser,
			originalWidgetsCache;

		hooks.beforeEach( () => {
			originalAddRequest = elementorCommon.ajax.addRequest;
			originalAddWidgetsCache = elementor.addWidgetsCache;
			originalDoAction = elementor.hooks.doAction;
			originalElementsCategories = elementor.config.document.panel.elements_categories;
			originalKitManager = elementor.kitManager;
			originalLocale = elementor.config.locale;
			originalRefreshContainer = $e.routes.refreshContainer;
			originalRun = $e.run;
			originalUser = elementor.config.user;
			originalWidgetsCache = elementor.widgetsCache;

			elementor.config.locale = 'en';
			elementor.config.user = {
				...elementor.config.user,
				locale: 'en',
			};
			elementor.widgetsCache = { stale: {} };
			elementor.refreshWidgetsRequest = null;
			elementor.refreshWidgetsNextRequest = null;
			elementor.addWidgetsCache = ( widgets ) => {
				elementor.widgetsCache = { ...elementor.widgetsCache, ...widgets };
			};
			elementor.kitManager = {
				...elementor.kitManager,
				renderGlobalsDefaultCSS: () => {},
			};
			elementor.hooks.doAction = () => {};
			$e.routes.refreshContainer = () => {};
			$e.run = () => {};
		} );

		hooks.afterEach( () => {
			elementorCommon.ajax.addRequest = originalAddRequest;
			elementor.addWidgetsCache = originalAddWidgetsCache;
			elementor.hooks.doAction = originalDoAction;
			elementor.config.document.panel.elements_categories = originalElementsCategories;
			elementor.kitManager = originalKitManager;
			elementor.config.locale = originalLocale;
			$e.routes.refreshContainer = originalRefreshContainer;
			$e.run = originalRun;
			elementor.config.user = originalUser;
			elementor.widgetsCache = originalWidgetsCache;
			elementor.refreshWidgetsRequest = null;
			elementor.refreshWidgetsNextRequest = null;
		} );

		QUnit.test( 'refreshWidgets(): queues a trailing refresh for calls made during an active request', async ( assert ) => {
			const firstWidgets = { heading: { title: 'Heading' } },
				firstCategories = { basic: { title: 'Basic' } },
				nextWidgets = { button: { title: 'Button' } },
				nextCategories = { custom: { title: 'Custom' } },
				requestedActions = [],
				refreshedContainers = [],
				runCommands = [],
				triggeredHooks = [],
				refreshResolvers = [];

			let addWidgetsCacheInvocations = 0,
				renderGlobalsInvocations = 0;

			elementorCommon.ajax.addRequest = ( action ) => {
				requestedActions.push( action );

				return new Promise( ( resolve ) => {
					refreshResolvers.push( resolve );
				} );
			};

			elementor.addWidgetsCache = ( widgets ) => {
				addWidgetsCacheInvocations++;
				elementor.widgetsCache = { ...elementor.widgetsCache, ...widgets };
			};

			elementor.kitManager = {
				...elementor.kitManager,
				renderGlobalsDefaultCSS: () => {
					renderGlobalsInvocations++;
				},
			};

			elementor.hooks.doAction = ( hook ) => {
				triggeredHooks.push( hook );
			};

			$e.routes.refreshContainer = ( container ) => {
				refreshedContainers.push( container );
			};

			$e.run = ( command ) => {
				runCommands.push( command );
			};

			const firstRequest = elementor.refreshWidgets(),
				secondRequest = elementor.refreshWidgets();

			assert.notStrictEqual( secondRequest, firstRequest );
			assert.deepEqual( requestedActions, [ REFRESH_WIDGETS_ACTION ] );

			refreshResolvers[ 0 ]( {
				widgets: firstWidgets,
				categories: firstCategories,
			} );

			const firstResponse = await firstRequest;

			await Promise.resolve();

			assert.deepEqual( firstResponse.widgets, firstWidgets );
			assert.deepEqual( firstResponse.categories, firstCategories );
			assert.deepEqual( requestedActions, [ REFRESH_WIDGETS_ACTION, REFRESH_WIDGETS_ACTION ] );
			assert.deepEqual( elementor.widgetsCache, firstWidgets );
			assert.deepEqual( elementor.config.document.panel.elements_categories, firstCategories );

			refreshResolvers[ 1 ]( {
				widgets: nextWidgets,
				categories: nextCategories,
			} );

			const secondResponse = await secondRequest;

			assert.deepEqual( secondResponse.widgets, nextWidgets );
			assert.deepEqual( secondResponse.categories, nextCategories );
			assert.deepEqual( elementor.widgetsCache, nextWidgets );
			assert.deepEqual( elementor.config.document.panel.elements_categories, nextCategories );
			assert.equal( addWidgetsCacheInvocations, EXPECTED_TRAILING_REFRESH_INVOCATIONS );
			assert.equal( renderGlobalsInvocations, EXPECTED_TRAILING_REFRESH_INVOCATIONS );
			assert.deepEqual( triggeredHooks, [ 'elementor/widgets/refreshed', 'elementor/widgets/refreshed' ] );
			assert.deepEqual( refreshedContainers, [ PANEL_CONTAINER, PANEL_CONTAINER ] );
			assert.deepEqual( runCommands, [ PREVIEW_RELOAD_COMMAND, PREVIEW_RELOAD_COMMAND ] );
		} );

		QUnit.test( 'refreshWidgets(): clears the active refresh request after failure', async ( assert ) => {
			const refreshError = new Error( 'Refresh failed' ),
				requestedActions = [];

			let rejectRefresh;

			elementorCommon.ajax.addRequest = ( action ) => {
				requestedActions.push( action );

				return new Promise( ( resolve, reject ) => {
					rejectRefresh = reject;
				} );
			};

			const firstRequest = elementor.refreshWidgets();

			rejectRefresh( refreshError );

			await assert.rejects( firstRequest, refreshError );

			elementorCommon.ajax.addRequest = ( action ) => {
				requestedActions.push( action );

				return Promise.resolve( {
					widgets: {},
					categories: {},
				} );
			};

			await elementor.refreshWidgets();

			assert.deepEqual( requestedActions, [ REFRESH_WIDGETS_ACTION, REFRESH_WIDGETS_ACTION ] );
		} );
	} );
} );
