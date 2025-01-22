import { __ } from '@wordpress/i18n';

const PROP_TYPE_CLASSES = 'classes';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class CreateStyle extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'bind', String, args );

		if ( 'label' in args ) {
			const isValidLabel = 'string' === typeof args.label && args.label.length > 0;

			if ( ! isValidLabel ) {
				throw new Error( 'Invalid label arg' );
			}
		}
	}

	randomId( containerId ) {
		return `s-${ containerId }-${ elementorCommon.helpers.getUniqueId() }`;
	}

	apply( args ) {
		const { container, styleDefID, bind, label } = args;
		const oldStyles = container.model.get( 'styles' ) || {};

		const newStyle = {
			id: styleDefID ?? this.randomId( container.id ),
			/* Translators: 1: container label, 2: number of old styles */
			label: label ?? sprintf( __( '%1$s Style %2$s', 'elementor' ), container.label, Object.keys( oldStyles ).length + 1 ),
			type: 'class',
			variants: [],
		};

		const oldBindSetting = container.settings.get( bind ) ?? {
			$$type: PROP_TYPE_CLASSES,
			value: [],
		};

		if ( oldBindSetting.$$type !== PROP_TYPE_CLASSES || ! Array.isArray( oldBindSetting.value ) ) {
			throw new Error( 'Invalid bind setting prop type' );
		}

		const newBindSetting = {
			[ bind ]: {
				$$type: PROP_TYPE_CLASSES,
				value: [ ...oldBindSetting.value, newStyle.id ],
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			settings: newBindSetting,
		} );

		const newStyles = {
			...oldStyles,
			[ newStyle.id ]: newStyle,
		};

		container.model.set( 'styles', newStyles );

		return newStyle;
	}
}

export default CreateStyle;
