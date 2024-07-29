import { __ } from '@wordpress/i18n';

const PROP_TYPE_CLASSES = 'classes';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */
export class CreateStyle extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'bind', String, args );
	}

	randomId( containerId ) {
		return `s-${ containerId }-${ elementorCommon.helpers.getUniqueId() }`;
	}

	apply( args ) {
		const { container, styleDefId, bind } = args;
		const oldStyles = container.model.get( 'styles' ) || {};

		/* Translators: 1: container label, 2: number of old styles */
		const label = sprintf( __( '%1$s Style %2$s', 'elementor' ), container.label, Object.keys( oldStyles ).length + 1 );

		const newStyle = {
			id: styleDefId ?? this.randomId( container.id ),
			label,
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
			options: {
				render: false,
			},
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
