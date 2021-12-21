import { useCallback, useMemo } from 'react';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';
import { useElementFolding } from 'elementor-regions/navigator/hooks';

export default function Header( { onClose } ) {
	const elementsFolding = useElementFolding();

	/**
	 * Whether all elements folding state is open.
	 *
	 * @var boolean
	 */
	const isAllOpen = useMemo(
		() => Object.values( elementsFolding ).every( ( state ) => state ),
		[ elementsFolding ]
	);

	/**
	 * Toggle all elements folding state.
	 *
	 * @type {(function(): void)|*}
	 */
	const toggleAll = useCallback( () => {
		$e.run( 'navigator/elements/toggle-folding-all', {
			state: ! isAllOpen,
		} );
	} );

	return (
		<div id="elementor-navigator__header">
			<Icon id="elementor-navigator__toggle-all" className={ isAllOpen ? 'eicon-collapse' : 'eicon-expand' } onClick={ toggleAll } />
			<div id="elementor-navigator__header__title">{ __( 'Navigator', 'elementor' ) }</div>
			<Icon id="elementor-navigator__close" className="eicon-close" onClick={ onClose } />
		</div>
	);
}

Header.propTypes = {
	onClose: PropTypes.func,
};
