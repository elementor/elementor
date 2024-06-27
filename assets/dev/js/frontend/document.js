export default class extends elementorModules.ViewModule {
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

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		const rawElements = this.baseElement.querySelectorAll( selectors.elements ),
			filteredElements = Array.from(rawElements).filter(el => !el.matches( this.baseElement.querySelector('.elementor')?.querySelectorAll( '.elementor-element' )));

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
