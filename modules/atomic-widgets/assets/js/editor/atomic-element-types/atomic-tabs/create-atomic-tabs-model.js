const createAtomicTabsModel = () => {
	const AtomicElementBaseModel = elementor.modules.elements.models.AtomicElementBase;

	return class AtomicTabsModel extends AtomicElementBaseModel {
		onElementCreate() {
			super.onElementCreate();

			const tabs = this.getChildrenByType( this.get( 'elements' ), 'e-tab' );
			const tabContents = this.getChildrenByType( this.get( 'elements' ), 'e-tab-content' );

			const currentSettings = this.get( 'settings' ) || {};
			currentSettings[ 'default-active-tab' ] = { $$type: 'string', value: tabs[ 0 ].id };

			this.set( 'settings', currentSettings );

			// TODO: maybe move this part to a dedicated "afterDefaultChildrenSet" method
			tabs.forEach( ( tab, index ) => 	{
				const tabContent = tabContents[ index ];

				tab.settings._cssid = { $$type: 'string', value: tab.id };
				tab.settings[ 'tab-content-id' ] = { $$type: 'string', value: tabContent.id };

				tabContent.settings._cssid = { $$type: 'string', value: tabContent.id };
				tabContent.settings[ 'tab-id' ] = { $$type: 'string', value: tab.id };
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
