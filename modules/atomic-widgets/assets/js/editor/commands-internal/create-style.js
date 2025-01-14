import { __ } from '@wordpress/i18n';
import { getRandomStyleId } from '../utils/get-random-style-id';

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

	randomId( container ) {
		// Keeping randomId, though we actually use getRandomStyleId, only because we enforce a fixed id in tests as can be seen at -
		// tests/jest/unit/modules/atomic-widgets/commands/styles.test.js
		// tests/jest/unit/modules/atomic-widgets/commands-internal/create-style.test.js
		return getRandomStyleId( container );
	}

	apply( args ) {
		const { container, styleDefID, bind, label } = args;
		const oldStyles = container.model.get( 'styles' ) || {};

		const newStyle = {
			id: styleDefID ?? this.randomId( container ),
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
