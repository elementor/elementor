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

	getSelectedElements( eElement, selector ) {
		return Array.from( eElement?.querySelectorAll( selector ) );
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
			innerElements = this.getSelectedElements( this.eElement, selectors.elements ),
			documents = this.getSelectedElements( this.eElement, selectors.document ),
			nestedElements = this.getSelectedNestedElements( documents, selectors.nestedDocumentElements ),
			filteredElements = this.getFilteredElements( innerElements, nestedElements );

		return {
			eElements: filteredElements,
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
			elementSettings = this.eElement?.dataset.elementorSettings || {};
		}

		return this.getItems( elementSettings, setting );
	}

	runElementsHandlers() {
		Array.from( this.elements?.eElements )?.forEach( ( element ) => setTimeout( () => elementorFrontend.elementsHandler.runReadyTrigger( element ) ) );
	}

	onInit() {
		this.eElement = this.getSettings( 'eElement' );

		super.onInit();

		this.isEdit = this.eElement?.classList?.contains( this.getSettings( 'classes.editMode' ) );

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
