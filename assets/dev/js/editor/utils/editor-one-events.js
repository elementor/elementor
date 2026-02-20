export class EditorOneEventManager {
	static getEventsManager() {
		return elementorCommon?.eventsManager;
	}

	static getConfig() {
		return this.getEventsManager()?.config;
	}

	static canSendEvents() {
		return elementorCommon?.config?.editor_events?.can_send_events || false;
	}

	static isEventsManagerAvailable() {
		const eventsManager = this.getEventsManager();
		return eventsManager && 'function' === typeof eventsManager.dispatchEvent;
	}

	static dispatchEvent( eventName, payload ) {
		if ( ! this.isEventsManagerAvailable() || ! this.canSendEvents() ) {
			return false;
		}

		try {
			return this.getEventsManager().dispatchEvent( eventName, payload );
		} catch ( error ) {
			return false;
		}
	}

	static toLowerSnake( value ) {
		if ( ! value || 'string' !== typeof value ) {
			return value;
		}
		return value.replace( /\s+/g, '_' ).toLowerCase();
	}

	static decodeHtmlEntities( text ) {
		if ( ! text || 'string' !== typeof text ) {
			return text;
		}
		const doc = new DOMParser().parseFromString( text, 'text/html' );
		return doc.body.textContent || text;
	}

	static isInEditorContext() {
		return 'undefined' !== typeof window.elementor && !! window.elementor?.documents;
	}

	static getFinderContext() {
		const config = this.getConfig();
		const isEditor = this.isInEditorContext();

		return {
			windowName: isEditor ? config?.appTypes?.editor : config?.appTypes?.wpAdmin,
			targetLocation: this.toLowerSnake( isEditor ? config?.locations?.topBar : config?.locations?.sidebar ),
		};
	}

	static createBasePayload( overrides = {} ) {
		const config = this.getConfig();
		return {
			app_type: config?.appTypes?.editor ?? 'editor',
			window_name: config?.appTypes?.editor ?? 'editor',
			...overrides,
		};
	}

	static sendTopBarPublishDropdown( targetName ) {
		const config = this.getConfig();
		return this.dispatchEvent( config?.names?.editorOne?.topBarPublishDropdown, this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: config?.targetTypes?.dropdownItem,
			target_name: targetName,
			interaction_result: config?.interactionResults?.actionSelected,
			target_location: this.toLowerSnake( config?.locations?.topBar ),
			location_l1: this.toLowerSnake( config?.secondaryLocations?.publishDropdown ),
			location_l2: config?.targetTypes?.dropdownItem,
			interaction_description: 'User selected an action from the publish dropdown',
		} ) );
	}

	static sendTopBarPageList( targetName, isCreate = false ) {
		const config = this.getConfig();
		return this.dispatchEvent( config?.names?.editorOne?.topBarPageList, this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: config?.targetTypes?.dropdownItem,
			target_name: targetName,
			interaction_result: isCreate ? config?.interactionResults?.create : config?.interactionResults?.navigate,
			target_location: this.toLowerSnake( config?.locations?.topBar ),
			location_l1: this.toLowerSnake( config?.secondaryLocations?.pageListDropdown ),
			location_l2: config?.targetTypes?.dropdownItem,
			interaction_description: 'User selected an action from the page list dropdown',
		} ) );
	}

	static sendSiteSettingsSession( { targetType, visitedItems = [], savedItems = [], state } ) {
		const config = this.getConfig();
		return this.dispatchEvent( config?.names?.editorOne?.siteSettingsSession, this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: targetType,
			target_name: 'site_settings',
			interaction_result: config?.interactionResults?.sessionEnd,
			target_location: this.toLowerSnake( config?.locations?.leftPanel ),
			location_l1: this.toLowerSnake( config?.secondaryLocations?.siteSettings ),
			interaction_description: 'Records areas visited as part of the site setting session',
			metadata: {
				visited_items: visitedItems,
				saved_items: savedItems,
			},
			state,
		} ) );
	}

	static sendELibraryNav( tabName ) {
		const config = this.getConfig();
		return this.dispatchEvent( config?.names?.editorOne?.eLibraryNav, this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.tabSelect ),
			target_type: config?.targetTypes?.tab,
			target_name: this.toLowerSnake( tabName ),
			interaction_result: config?.interactionResults?.tabChanged,
			target_location: this.toLowerSnake( config?.locations?.elementorLibrary ),
			location_l1: this.toLowerSnake( config?.secondaryLocations?.libraryTabs ),
			interaction_description: 'User navigates within elementor library',
		} ) );
	}

	static sendELibraryInsert( { assetId, assetName, libraryType, proRequired = false } ) {
		const config = this.getConfig();
		const payload = this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.insert ),
			target_type: config?.targetTypes?.button,
			target_name: String( assetId ),
			interaction_result: config?.interactionResults?.assetInserted,
			target_location: this.toLowerSnake( config?.locations?.elementorLibrary ),
			location_l1: this.toLowerSnake( libraryType ),
			location_l2: this.toLowerSnake( config?.secondaryLocations?.assetCard ),
			interaction_description: 'User inserts block/pages from elementor library',
			metadata: {
				template_id: String( assetId ),
				template_name: this.decodeHtmlEntities( assetName ) || '',
			},
		} );

		if ( proRequired ) {
			payload.state = 'pro_plan_required';
		}

		return this.dispatchEvent( config?.names?.editorOne?.eLibraryInsert, payload );
	}

	static sendELibraryFavorite( { assetId, assetName, libraryType, isFavorite, proRequired = false } ) {
		const config = this.getConfig();
		const payload = this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: config?.targetTypes?.toggle,
			target_name: String( assetId ),
			interaction_result: config?.interactionResults?.assetFavorite,
			target_value: Boolean( isFavorite ),
			target_location: this.toLowerSnake( config?.locations?.elementorLibrary ),
			location_l1: this.toLowerSnake( libraryType ),
			location_l2: this.toLowerSnake( config?.secondaryLocations?.assetCard ),
			interaction_description: 'User favorite block/pages from elementor library',
			metadata: {
				template_id: String( assetId ),
				template_name: this.decodeHtmlEntities( assetName ) || '',
			},
		} );

		if ( proRequired ) {
			payload.state = 'pro_plan_required';
		}

		return this.dispatchEvent( config?.names?.editorOne?.eLibraryFavorite, payload );
	}

	static sendELibraryGenerateAi( { assetId, assetName, libraryType } ) {
		const config = this.getConfig();
		return this.dispatchEvent( config?.names?.editorOne?.eLibraryGenerateAi, this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: config?.targetTypes?.button,
			target_name: String( assetId ),
			interaction_result: config?.interactionResults?.aiGenerate,
			target_location: this.toLowerSnake( config?.locations?.elementorLibrary ),
			location_l1: this.toLowerSnake( libraryType ),
			location_l2: this.toLowerSnake( config?.secondaryLocations?.assetCard ),
			interaction_description: 'User generated block/page based on a library asset',
			metadata: {
				template_id: String( assetId ),
				template_name: this.decodeHtmlEntities( assetName ) || '',
			},
		} ) );
	}

	static sendFinderSearchInput( { resultsCount, searchTerm = null } ) {
		const config = this.getConfig();
		const hasResults = resultsCount > 0;
		const finderContext = this.getFinderContext();

		const payload = this.createBasePayload( {
			window_name: finderContext.windowName,
			interaction_type: this.toLowerSnake( config?.triggers?.typing ),
			target_type: config?.targetTypes?.searchInput,
			target_name: 'finder',
			interaction_result: hasResults ? config?.interactionResults?.resultsUpdated : config?.interactionResults?.noResults,
			target_location: finderContext.targetLocation,
			location_l1: this.toLowerSnake( config?.secondaryLocations?.finder ),
			interaction_description: 'Finder search input, follows debounce behavior',
			metadata: {
				results_count: resultsCount,
			},
		} );

		if ( ! hasResults && searchTerm ) {
			payload.metadata.search_term = searchTerm;
		}

		return this.dispatchEvent( config?.names?.editorOne?.finderSearchInput, payload );
	}

	static sendFinderResultSelect( choice ) {
		const config = this.getConfig();
		const finderContext = this.getFinderContext();

		return this.dispatchEvent( config?.names?.editorOne?.finderResultSelect, this.createBasePayload( {
			window_name: finderContext.windowName,
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: config?.targetTypes?.searchResult,
			target_name: choice,
			interaction_result: config?.interactionResults?.selected,
			target_location: finderContext.targetLocation,
			location_l1: this.toLowerSnake( config?.secondaryLocations?.finder ),
			location_l2: this.toLowerSnake( config?.secondaryLocations?.finderResults ),
			interaction_description: 'Finder search results was selected',
		} ) );
	}

	static sendCanvasEmptyBoxAction( { targetName, metadata = {}, containerCreated = null } ) {
		const config = this.getConfig();
		const payload = this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.click ),
			target_type: config?.targetTypes?.buttons,
			target_name: targetName,
			interaction_result: config?.interactionResults?.selected,
			target_location: this.toLowerSnake( config?.locations?.canvas ),
			location_l1: this.toLowerSnake( config?.secondaryLocations?.emptyBox ),
			interaction_description: 'Empty box on canvas actions',
		} );

		if ( Object.keys( metadata ).length > 0 ) {
			payload.metadata = metadata;
		}

		if ( containerCreated !== null ) {
			payload.state = containerCreated;
		}

		return this.dispatchEvent( config?.names?.editorOne?.canvasEmptyBoxAction, payload );
	}

	static sendWidgetPanelSearch( { resultsCount, userInput = null } ) {
		const config = this.getConfig();
		const hasResults = resultsCount > 0;
		const payload = this.createBasePayload( {
			interaction_type: this.toLowerSnake( config?.triggers?.typing ),
			target_type: config?.targetTypes?.searchWidget,
			target_name: 'search_widget',
			interaction_result: hasResults ? config?.interactionResults?.resultsUpdated : config?.interactionResults?.noResults,
			target_location: this.toLowerSnake( config?.locations?.leftPanel ),
			location_l1: this.toLowerSnake( config?.locations?.widgetPanel ),
			location_l2: this.toLowerSnake( config?.secondaryLocations?.searchBar ),
			interaction_description: 'Widget search input, follows debounce behavior',
		} );

		if ( ! hasResults && userInput ) {
			payload.metadata = { user_input: userInput };
		}

		return this.dispatchEvent( config?.names?.editorOne?.widgetPanelSearch, payload );
	}
}

export const createDebouncedFinderSearch = ( delay = 300 ) => {
	return _.debounce( ( resultsCount, searchTerm ) => {
		EditorOneEventManager.sendFinderSearchInput( { resultsCount, searchTerm } );
	}, delay );
};

export const createDebouncedWidgetPanelSearch = ( delay = 2000 ) => {
	return _.debounce( ( resultsCount, userInput ) => {
		EditorOneEventManager.sendWidgetPanelSearch( { resultsCount, userInput } );
	}, delay );
};

export default EditorOneEventManager;
