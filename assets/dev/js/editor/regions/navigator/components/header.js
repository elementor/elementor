import Icon from 'elementor-app/ui/atoms/icon';
import { useGlobalListState } from '../context/list-state-context';
import PropTypes from 'prop-types';

export default function Header( { onClose } ) {
	const { isAllOpen, toggleAll } = useGlobalListState();

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
