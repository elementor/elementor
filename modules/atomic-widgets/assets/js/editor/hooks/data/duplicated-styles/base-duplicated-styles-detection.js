import { classesPropTypeUtil } from '@elementor/editor-props';
import { getRandomStyleId } from '../../../utils/get-random-style-id';

/**
 * @typedef {import('assets/dev/js/editor/container/container')} Container
 */

/**
 * @typedef {Object} StyledElementData
 * @property {Container} container       - The container instance.
 * @property {string}    classesPropKey  - The key for the classes property.
 * @property {Object}    originalStyles  - The original styles object.
 * @property {string[]}  originalClasses - An array of original class names.
 */

const debouncedNotify = _.debounce( () => $e.run( 'document/atomic-widgets/styles-update' ), 200 );

export class BaseDuplicatedStylesDetection extends $e.modules.hookData.After {
	getId() {
		return `atomic-widgets/duplicated-styles/-${ this.getCommand() }`;
	}

	/**
	 * @param {StyledElementData} styledElements
	 */
	updateStyle( { originalStyles, originalClasses, classesPropKey, container } ) {
		const newStyles = {};

		const changedIds = {}; // Conversion map - {[originalId: string]: newId: string}

		Object.entries( originalStyles ).forEach( ( [ originalStyleId, style ] ) => {
			const newStyleId = getRandomStyleId( container );

			newStyles[ newStyleId ] = structuredClone( { ...style, id: newStyleId } );

			changedIds[ originalStyleId ] = newStyleId;
		} );

		const newClasses = classesPropTypeUtil.create( originalClasses.map( ( className ) => changedIds[ className ] ?? className ) );

		// Update classes array
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				[ classesPropKey ]: newClasses,
			},
		} );

		// Update local styles
		container.model.set( 'styles', newStyles );
	}

	/**
	 * @param {StyledElementData[]} styledElements
	 * @param {Container}           model
	 * @return {StyledElementData[]}
	 */
	getDuplicatedStyledElements(
		styledElements = [],
		model,
	) {
		const container = window.elementor?.getContainer( model.id );
		const widgetsCache = window.elementor?.widgetsCache ?? {};

		const widgetType = container.type !== 'widget' ? container.type : container.model.get( 'widgetType' );
		const originalStyles = container.model.get( 'styles' );
		const settings = container.settings?.attributes;

		const elementType = widgetType ? widgetsCache?.[ widgetType ] : null;

		const [ classesPropKey ] =
		Object.entries( elementType?.atomic_props_schema ?? {} ).find(
			( [ , propType ] ) => 'plain' === propType.kind && 'classes' === propType.key,
		) ?? [];

		const originalClasses =
			classesPropKey && settings ? settings[ classesPropKey ]?.value : null;

		const isDuplicatedStyle = originalClasses?.[ 0 ] ? -1 === originalClasses[ 0 ].indexOf( container.id ) : false;

		if ( classesPropKey && originalStyles && originalClasses && isDuplicatedStyle ) {
			styledElements.push( {
				container,
				classesPropKey,
				originalStyles,
				originalClasses,
			} );
		}

		return styledElements;
	}

	notifyStyleUpdate() {
		debouncedNotify();
	}
}
export default BaseDuplicatedStylesDetection;
