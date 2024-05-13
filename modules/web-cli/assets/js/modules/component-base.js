import CommandCallbackBase from 'elementor-api/modules/command-callback-base';

import { createSlice } from '@reduxjs/toolkit';
import Module from 'elementor/assets/dev/js/modules/imports/module.js';
import ForceMethodImplementation from '../utils/force-method-implementation';
import Deprecation from 'elementor-api/utils/deprecation';

/**
 * @typedef {import('./command-infra')} CommandInfra
 * @typedef {import('./hook-base')} HookBase
 * @typedef {import('../core/states/ui-state-base')} UiStateBase
 */

export default class ComponentBase extends Module {
	__construct( args = {} ) {
		if ( args.manager ) {
			this.manager = args.manager;
		}

		this.commands = this.defaultCommands();
		this.commandsInternal = this.defaultCommandsInternal();
		this.hooks = this.defaultHooks();
		this.routes = this.defaultRoutes();
		this.tabs = this.defaultTabs();
		this.shortcuts = this.defaultShortcuts();
		this.utils = this.defaultUtils();
		this.data = this.defaultData();
		this.uiStates = this.defaultUiStates();
		this.states = this.defaultStates();

		this.defaultRoute = '';
		this.currentTab = '';
	}

	registerAPI() {
		Object.entries( this.getTabs() ).forEach( ( tab ) => this.registerTabRoute( tab[ 0 ] ) );

		Object.entries( this.getRoutes() ).forEach( ( [ route, callback ] ) => this.registerRoute( route, callback ) );

		Object.entries( this.getCommands() ).forEach( ( [ command, callback ] ) => this.registerCommand( command, callback ) );

		Object.entries( this.getCommandsInternal() ).forEach( ( [ command, callback ] ) => this.registerCommandInternal( command, callback ) );

		Object.values( this.getHooks() ).forEach( ( instance ) => this.registerHook( instance ) );

		Object.entries( this.getData() ).forEach( ( [ command, callback ] ) => this.registerData( command, callback ) );

		Object.values( this.getUiStates() ).forEach( ( instance ) => this.registerUiState( instance ) );

		Object.entries( this.getStates() ).forEach( ( [ id, state ] ) => this.registerState( id, state ) );
	}

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * @return {string} namespace
	 */
	getNamespace() {
		ForceMethodImplementation();
	}

	/**
	 * @deprecated since 3.7.0, use `getServiceName()` instead.
	 */
	getRootContainer() {
		Deprecation.deprecated( 'getRootContainer()', '3.7.0', 'getServiceName()' );

		return this.getServiceName();
	}

	getServiceName() {
		return this.getNamespace().split( '/' )[ 0 ];
	}

	get store() {
		return $e.store.get( this.getNamespace() );
	}

	defaultTabs() {
		return {};
	}

	defaultRoutes() {
		return {};
	}

	defaultCommands() {
		return {};
	}

	defaultCommandsInternal() {
		return {};
	}

	defaultHooks() {
		return {};
	}

	/**
	 * Get the component's default UI states.
	 *
	 * @return {Object} default UI states
	 */
	defaultUiStates() {
		return {};
	}

	/**
	 * Get the component's Redux slice settings.
	 *
	 * @return {Object} Redux slice settings
	 */
	defaultStates() {
		return {};
	}

	defaultShortcuts() {
		return {};
	}

	defaultUtils() {
		return {};
	}

	defaultData() {
		return {};
	}

	getCommands() {
		return this.commands;
	}

	getCommandsInternal() {
		return this.commandsInternal;
	}

	getHooks() {
		return this.hooks;
	}

	/**
	 * Retrieve the component's UI states.
	 *
	 * @return {Object} UI states
	 */
	getUiStates() {
		return this.uiStates;
	}

	/**
	 * Retrieve the component's Redux Slice.
	 *
	 * @return {Object} Redux Slice
	 */
	getStates() {
		return this.states;
	}

	getRoutes() {
		return this.routes;
	}

	getTabs() {
		return this.tabs;
	}

	getShortcuts() {
		return this.shortcuts;
	}

	getData() {
		return this.data;
	}

	/**
	 * @param {string}                      command
	 * @param {(()=>{}|CommandInfra)}       context
	 * @param {'default'|'internal'|'data'} commandsType
	 */
	registerCommand( command, context, commandsType = 'default' ) {
		let commandsManager;

		switch ( commandsType ) {
			case 'default':
				commandsManager = $e.commands;
				break;

			case 'internal':
				commandsManager = $e.commandsInternal;
				break;

			case 'data':
				commandsManager = $e.data;
				break;

			default:
				throw new Error( `Invalid commands type: '${ command }'` );
		}

		const fullCommand = this.getNamespace() + '/' + command,
			instanceType = context.getInstanceType ? context.getInstanceType() : false,
			registerConfig = {
				command: fullCommand,
				component: this,
			};

		// Support pure callback.
		if ( ! instanceType ) {
			if ( $e.devTools ) {
				$e.devTools.log.warn( `Attach command-callback-base, on command: '${ fullCommand }', context is unknown type.` );
			}

			registerConfig.callback = context;

			// Unique class.
			context = class extends CommandCallbackBase {};
		}

		context.setRegisterConfig( registerConfig );

		commandsManager.register( this, command, context );
	}

	/**
	 * @param {HookBase} instance
	 */
	registerHook( instance ) {
		return instance.register();
	}

	registerCommandInternal( command, context ) {
		this.registerCommand( command, context, 'internal' );
	}

	/**
	 * Register a UI state.
	 *
	 * @param {UiStateBase} instance - UI state instance.
	 *
	 * @return {void}
	 */
	registerUiState( instance ) {
		$e.uiStates.register( instance );
	}

	/**
	 * Register a Redux Slice.
	 *
	 * @param {string} id          - State id.
	 * @param {Object} stateConfig - The state config.
	 *
	 * @return {void}
	 */
	registerState( id, stateConfig ) {
		id = this.getNamespace() + ( id ? `/${ id }` : '' );

		const slice = createSlice( {
			...stateConfig,
			name: id,
		} );

		$e.store.register( id, slice );
	}

	registerRoute( route, callback ) {
		$e.routes.register( this, route, callback );
	}

	registerData( command, context ) {
		this.registerCommand( command, context, 'data' );
	}

	unregisterRoute( route ) {
		$e.routes.unregister( this, route );
	}

	registerTabRoute( tab ) {
		this.registerRoute( tab, ( args ) => this.activateTab( tab, args ) );
	}

	dependency() {
		return true;
	}

	open() {
		return true;
	}

	close() {
		if ( ! this.isOpen ) {
			return false;
		}

		this.isOpen = false;

		this.inactivate();

		$e.routes.clearCurrent( this.getNamespace() );

		$e.routes.clearHistory( this.getServiceName() );

		return true;
	}

	activate() {
		$e.components.activate( this.getNamespace() );
	}

	inactivate() {
		$e.components.inactivate( this.getNamespace() );
	}

	isActive() {
		return $e.components.isActive( this.getNamespace() );
	}

	onRoute( route ) {
		this.toggleRouteClass( route, true );
		this.toggleHistoryClass();

		this.activate();
		this.trigger( 'route/open', route );
	}

	onCloseRoute( route ) {
		this.toggleRouteClass( route, false );

		this.inactivate();
		this.trigger( 'route/close', route );
	}

	setDefaultRoute( route ) {
		this.defaultRoute = this.getNamespace() + '/' + route;
	}

	getDefaultRoute() {
		return this.defaultRoute;
	}

	removeTab( tab ) {
		delete this.tabs[ tab ];
		this.unregisterRoute( tab );
	}

	hasTab( tab ) {
		return ! ! this.tabs[ tab ];
	}

	addTab( tab, args, position ) {
		this.tabs[ tab ] = args;
		// It can be 0.
		if ( 'undefined' !== typeof position ) {
			const newTabs = {};
			const ids = Object.keys( this.tabs );
			// Remove new tab
			ids.pop();

			// Add it to position.
			ids.splice( position, 0, tab );

			ids.forEach( ( id ) => {
				newTabs[ id ] = this.tabs[ id ];
			} );

			this.tabs = newTabs;
		}

		this.registerTabRoute( tab );
	}

	getTabsWrapperSelector() {
		return '';
	}

	getTabRoute( tab ) {
		return this.getNamespace() + '/' + tab;
	}

	renderTab( tab ) {} // eslint-disable-line

	activateTab( tab, args ) {
		this.renderTab( tab, args );

		jQuery( this.getTabsWrapperSelector() + ' .elementor-component-tab' )
			.off( 'click' )
			.on( 'click', ( event ) => {
				$e.route( this.getTabRoute( event.currentTarget.dataset.tab ), args );
			} )
			.removeClass( 'elementor-active' )
			.filter( '[data-tab="' + tab + '"]' )
			.addClass( 'elementor-active' );
	}
	getActiveTabConfig() {
		return this.tabs[ this.currentTab ] || {};
	}

	getBodyClass( route ) {
		return 'e-route-' + route.replace( /\//g, '-' );
	}

	/**
	 * If command includes uppercase character convert it to lowercase and add `-`.
	 * e.g: `CopyAll` is converted to `copy-all`.
	 *
	 * @param {string} commandName
	 */
	normalizeCommandName( commandName ) {
		return commandName.replace( /[A-Z]/g, ( match, offset ) => ( offset > 0 ? '-' : '' ) + match.toLowerCase() );
	}

	/**
	 * @param {{}} commandsFromImport
	 * @return {{}} imported commands
	 */
	importCommands( commandsFromImport ) {
		const commands = {};

		// Convert `Commands` to `ComponentBase` workable format.
		Object.entries( commandsFromImport ).forEach( ( [ className, Class ] ) => {
			const command = this.normalizeCommandName( className );
			commands[ command ] = Class;
		} );

		return commands;
	}

	importHooks( hooksFromImport ) {
		const hooks = {};

		for ( const key in hooksFromImport ) {
			const hook = new hooksFromImport[ key ];

			hooks[ hook.getId() ] = hook;
		}

		return hooks;
	}

	/**
	 * Import & initialize the component's UI states.
	 * Should be used inside `defaultUiState()`.
	 *
	 * @param {Object} statesFromImport - UI states from import.
	 *
	 * @return {Object} UI States
	 */
	importUiStates( statesFromImport ) {
		const uiStates = {};

		Object.values( statesFromImport ).forEach( ( className ) => {
			const uiState = new className( this );

			uiStates[ uiState.getId() ] = uiState;
		} );

		return uiStates;
	}

	/**
	 * Set a UI state value.
	 * TODO: Should we provide such function? Maybe the developer should implicitly pass the full state ID?
	 *
	 * @param {string} state - Non-prefixed state ID.
	 * @param {*}      value - New state value.
	 *
	 * @return {void}
	 */
	setUiState( state, value ) {
		$e.uiStates.set( `${ this.getNamespace() }/${ state }`, value );
	}

	toggleRouteClass( route, state ) {
		document.body.classList.toggle( this.getBodyClass( route ), state );
	}

	toggleHistoryClass() {
		document.body.classList.toggle( 'e-routes-has-history', !! $e.routes.getHistory( this.getServiceName() ).length );
	}
}
