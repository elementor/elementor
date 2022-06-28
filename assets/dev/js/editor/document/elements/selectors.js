export const elementsSelection = {
	getElementsIds() {
		return $e.store.getState( 'document/elements/selection' );
	},

	getContainers( fallback = null ) {
		const elementsIds = this.getElementsIds() || [];

		if ( ! elementsIds.length && fallback ) {
			return Array.isArray( fallback ) ? fallback : [ fallback ];
		}

		return elementsIds.map( ( elementId ) => elementor.getContainer( elementId ) );
	},

	has( elementId ) {
		return this.getElementsIds().includes( elementId );
	},

	isSameType() {
		const containers = this.getContainers();

		if ( ! containers.length ) {
			return false;
		}

		return containers.every( ( container ) => container.type === containers[ 0 ].type );
	},

	isMultiple() {
		return this.getElementsIds().length > 1;
	},
};
