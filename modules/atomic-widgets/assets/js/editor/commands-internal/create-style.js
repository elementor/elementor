import { __ } from '@wordpress/i18n';

/**
 * @typedef {import('../../../container/container')} Container
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

		const $$type = 'classes'; // TODO: Style Transformer should be used here.

		const oldBindSetting = container.settings.get( bind ) ?? {
			$$type,
			value: [],
		};

		if ( oldBindSetting.$$type !== $$type ) {
			throw new Error( 'Invalid bind prop type' );
		}

		if ( ! Array.isArray( oldBindSetting.value ) ) {
			throw new Error( 'Invalid bind prop type' );
		}

		const newSetting = {
			[ bind ]: {
				$$type,
				value: [ ...oldBindSetting.value, newStyle.id ],
			},
		};

		$e.internal( 'document/elements/set-settings', {
			container,
			options: {
				render: false,
			},
			settings: newSetting,
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
