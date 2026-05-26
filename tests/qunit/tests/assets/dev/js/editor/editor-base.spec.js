const EXPECTED_SINGLE_INVOCATION = 1;
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
		} );

		QUnit.test( 'refreshWidgets(): reuses the active refresh request', async ( assert ) => {
			const refreshedWidgets = { heading: { title: 'Heading' } },
				refreshedCategories = { basic: { title: 'Basic' } },
				requestedActions = [],
				refreshedContainers = [],
				runCommands = [],
				triggeredHooks = [];

			let addWidgetsCacheInvocations = 0,
				renderGlobalsInvocations = 0,
				resolveRefresh;

			elementorCommon.ajax.addRequest = ( action ) => {
				requestedActions.push( action );

				return new Promise( ( resolve ) => {
					resolveRefresh = resolve;
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

			assert.strictEqual( secondRequest, firstRequest );

			resolveRefresh( {
				widgets: refreshedWidgets,
				categories: refreshedCategories,
			} );

			const response = await firstRequest;

			assert.deepEqual( response.widgets, refreshedWidgets );
			assert.deepEqual( response.categories, refreshedCategories );
			assert.deepEqual( requestedActions, [ REFRESH_WIDGETS_ACTION ] );
			assert.deepEqual( elementor.widgetsCache, refreshedWidgets );
			assert.deepEqual( elementor.config.document.panel.elements_categories, refreshedCategories );
			assert.equal( addWidgetsCacheInvocations, EXPECTED_SINGLE_INVOCATION );
			assert.equal( renderGlobalsInvocations, EXPECTED_SINGLE_INVOCATION );
			assert.deepEqual( triggeredHooks, [ 'elementor/widgets/refreshed' ] );
			assert.deepEqual( refreshedContainers, [ PANEL_CONTAINER ] );
			assert.deepEqual( runCommands, [ PREVIEW_RELOAD_COMMAND ] );
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

			const firstRequest = elementor.refreshWidgets(),
				secondRequest = elementor.refreshWidgets();

			assert.strictEqual( secondRequest, firstRequest );

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
