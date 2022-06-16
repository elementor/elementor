import { useCallback, useMemo } from 'react';
import { useElementFolding } from '../hooks';
import Icon from 'elementor-app/ui/atoms/icon';
import PropTypes from 'prop-types';

export function Header( { onClose } ) {
	const [ elementsFolding, setElementsFolding ] = useElementFolding();

	/**
	 * Whether all elements folding state is open.
	 *
	 * @type boolean
	 */
	const isAllOpen = useMemo(
		() => {
			const elements = Object.values( elementsFolding );

			// If there are no elements (page initialization), consider it `false`.
			return elements.length ?
				elements.every( ( state ) => state ) :
				false;
		},
		[ elementsFolding ]
	);

	/**
	 * Toggle all elements folding state.
	 *
	 * @void
	 */
	const toggleAll = useCallback( () => {
		setElementsFolding( ! isAllOpen );
	}, [ isAllOpen ] );

	return (
		<header id="elementor-navigator__header">
			<Icon id="elementor-navigator__toggle-all"
				className={ isAllOpen ? 'eicon-collapse' : 'eicon-expand' }
				title={ __( 'Toggle folding all' ) }
				onClick={ toggleAll }
				role="button" />
			<div id="elementor-navigator__header__title">
				{ __( 'Navigator', 'elementor' ) }
			</div>
			<Icon id="elementor-navigator__close"
				className="eicon-close"
				title={ __( 'Close' ) }
				onClick={ onClose }
				role="button" />
		</header>
	);
}

Header.propTypes = {
	onClose: PropTypes.func,
};

export default Header;
