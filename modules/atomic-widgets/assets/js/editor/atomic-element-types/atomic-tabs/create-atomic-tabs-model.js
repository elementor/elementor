const createAtomicTabsModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicTabsModel extends AtomicElementBaseModel {
		onElementCreate() {
			super.onElementCreate();

			const tabs = this.getChildrenByType( this.get( 'elements' ), 'e-tab' );
			const tabPanels = this.getChildrenByType( this.get( 'elements' ), 'e-tab-panel' );

			const currentSettings = this.get( 'settings' ) || {};
			currentSettings[ 'default-active-tab' ] = { $$type: 'string', value: tabs[ 0 ].id };

			this.set( 'settings', currentSettings );

			// TODO: maybe move this part to a dedicated "afterDefaultChildrenSet" method
			tabs.forEach( ( tab, index ) => 	{
				tab.settings._cssid = { $$type: 'string', value: tab.id };
				tab.settings[ 'tab-panel-id' ] = { $$type: 'string', value: tabPanels[ index ].id };

				const tabPanel = tabPanels[ index ];
				tabPanel.settings._cssid = { $$type: 'string', value: tabPanels[ index ].id };
				tabPanel.settings[ 'tab-id' ] = { $$type: 'string', value: tab.id };
				tabPanel.settings[ 'tabs-id' ] = { $$type: 'string', value: this.id };
			} );
		}

		getChildrenByType( elements, type ) {
			const foundElements = [];

			const searchRecursively = ( collection ) => {
				collection.forEach( ( element ) => {
					if ( type === element.elType ) {
						foundElements.push( element );
					}

					const childElements = element.elements;
					if ( childElements && childElements.length > 0 ) {
						searchRecursively( childElements );
					}
				} );
			};

			searchRecursively( elements );

			return foundElements;
		}
	};
};

export default createAtomicTabsModel;
