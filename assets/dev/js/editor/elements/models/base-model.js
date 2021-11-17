/**
 * The class propose is to share the common methods and properties between all available models.
 */
export default class BaseModel extends Backbone.Model {
	isValidChild( childModel ) {
		const parentElType = this.get( 'elType' ),
			draggedElType = childModel.get( 'elType' ),
			parentIsInner = this.get( 'isInner' ),
			draggedIsInner = childModel.get( 'isInner' );

		// Block's inner-section at inner-section column.
		if ( draggedIsInner && 'section' === draggedElType && parentIsInner && 'column' === parentElType ) {
			return false;
		}

		// Allow only nested containers.
		if ( draggedElType === parentElType && 'container' !== draggedElType ) {
			return false;
		}

		if ( 'section' === draggedElType && ! draggedIsInner && 'column' === parentElType ) {
			return false;
		}

		const childTypes = elementor.helpers.getElementChildType( parentElType );

		return childTypes && -1 !== childTypes.indexOf( childModel.get( 'elType' ) );
	}
}
