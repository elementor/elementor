const createAtomicTabsModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicTabsModel extends AtomicElementBaseModel {
		onElementCreate() {
			super.onElementCreate();

			const tabs = this.getChildrenByType( this.get( 'elements' ), 'e-tab' );
			const tabPanels = this.getChildrenByType( this.get( 'elements' ), 'e-tab-panel' );

			const currentSettings = this.get( 'settings' ) || {};
			currentSettings.default_active_tab = { $$type: 'string', value: tabs[ 0 ].id };

			this.set( 'settings', currentSettings );

			tabPanels.forEach( ( tabPanel, index ) => {
				tabPanel.settings._cssid = { $$type: 'string', value: tabPanel.id };
				tabPanel.settings.tab_id = { $$type: 'string', value: tabs[ index ].id };
			} );

			tabs.forEach( ( tab, index ) => 	{
				tab.settings._cssid = { $$type: 'string', value: tab.id };
				tab.settings.tab_panel_id = { $$type: 'string', value: tabPanels[ index ].id };
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
