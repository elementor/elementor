export default class extends elementorModules.ViewModuleFrontend {
	getDefaultSettings() {
		return {
			selectors: {
				elements: '.elementor-element',
				nestedDocumentElements: '.elementor .elementor-element',
			},
			classes: {
				editMode: 'elementor-edit-mode',
			},
		};
	}

	selectElements( context, selector ) {
		return Array.from( context.querySelectorAll( selector ) );
	}

	selectNestedElements( documents, nestedSelector ) {
		let nestedElements = [];

		documents.forEach( ( doc ) => {
			nestedElements = nestedElements.concat( Array.from( doc.querySelectorAll( nestedSelector ) ) );
		} );

		return nestedElements;
	}

	filterElements( elements, nestedElements ) {
		return elements.filter( ( element ) => ! nestedElements.includes( element ) );
	}

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );
		const context = this.baseElement;
		const innerElements = this.selectElements( context, selectors.elements );
		const documents = this.selectElements( context, '.elementor' );
		const nestedElements = this.selectNestedElements( documents, selectors.nestedDocumentElements );
		const filteredElements = this.filterElements( innerElements, nestedElements );

		return {
			baseElements: filteredElements,
		};
	}

	getDocumentSettings( setting ) {
		let elementSettings;

		if ( this.isEdit ) {
			elementSettings = {};

			const settings = elementor.settings.page.model;

			settings.getActiveControls().forEach(function(controlKey) {
				elementSettings[controlKey] = settings.attributes[controlKey];
			});
		} else {
			elementSettings = this.baseElement.dataset.elementorSettings || {};
		}

		return this.getItems( elementSettings, setting );
	}

	runElementsHandlers() {
		Array.from( this.elements?.baseElements )?.forEach( ( element ) => setTimeout( () => elementorFrontend.elementsHandler.runReadyTrigger( element ) ) );
	}

	onInit() {
		this.baseElement = this.getSettings( 'baseElement' );

		super.onInit();

		this.isEdit = this.baseElement.classList.contains( this.getSettings( 'classes.editMode' ) );

		if ( this.isEdit ) {
			elementor.on( 'document:loaded', () => {
				elementor.settings.page.model.addEventListener('change', this.onSettingsChange.bind(this));
			} );
		} else {
			this.runElementsHandlers();
		}
	}

	onSettingsChange() {}
}
