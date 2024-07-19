export default class extends elementorModules.ViewModuleFrontend {
	getDefaultSettings() {
		return {
			selectors: {
				document: '.elementor',
				elements: '.elementor-element',
				nestedDocumentElements: '.elementor .elementor-element',
			},
			classes: {
				editMode: 'elementor-edit-mode',
			},
		};
	}

	getSelectedElements( baseElement, selector ) {
		return Array.from( baseElement?.querySelectorAll( selector ) );
	}

	getSelectedNestedElements( documents, nestedSelector ) {
		let nestedElements = [];

		documents.forEach( ( document ) => {
			nestedElements = nestedElements?.concat( Array.from( document?.querySelectorAll( nestedSelector ) ) );
		} );

		return nestedElements;
	}

	getFilteredElements( elements, nestedElements ) {
		return elements?.filter( ( element ) => ! nestedElements?.includes( element ) );
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' ),
			innerElements = this.getSelectedElements( this.baseElement, selectors.elements ),
			documents = this.getSelectedElements( this.baseElement, selectors.document ),
			nestedElements = this.getSelectedNestedElements( documents, selectors.nestedDocumentElements ),
			filteredElements = this.getFilteredElements( innerElements, nestedElements );

		return {
			baseElements: filteredElements,
		};
	}

	getDocumentSettings( setting ) {
		let elementSettings;

		if ( this.isEdit ) {
			elementSettings = {};

			const settings = elementor.settings.page.model;

			settings?.getActiveControls()?.forEach( ( controlKey ) => {
				elementSettings[ controlKey ] = settings?.attributes?.[ controlKey ];
			} );
		} else {
			elementSettings = this.baseElement?.dataset.elementorSettings || {};
		}

		return this.getItems( elementSettings, setting );
	}

	runElementsHandlers() {
		Array.from( this.elements?.baseElements )?.forEach( ( element ) => setTimeout( () => elementorFrontend.elementsHandler.runReadyTrigger( element ) ) );
	}

	onInit() {
		this.baseElement = this.getSettings( 'baseElement' );

		super.onInit();

		this.isEdit = this.baseElement?.classList?.contains( this.getSettings( 'classes.editMode' ) );

		if ( this.isEdit ) {
			elementor.on( 'document:loaded', () => {
				elementor.settings.page.model.on( 'change', this.onSettingsChange.bind( this ) );
			} );
		} else {
			this.runElementsHandlers();
		}
	}

	onSettingsChange() {}
}
