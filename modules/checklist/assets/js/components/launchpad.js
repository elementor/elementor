import PropTypes from 'prop-types';
import CheckListWrapper from './checklist-wrapper';
import Header from './header';
import Paper from '@elementor/ui/Paper';

const Launchpad = ( props ) => {
	const { setIsOpen } = props;

	return (
		<Paper elevation={ 5 } sx={ {
			position: 'fixed',
			width: '360px',
			bottom: '40px',
			insetInlineEnd: '40px',
			zIndex: '99999',
			hidden: true,
			maxHeight: '645px',
			overflowY: 'auto',
		} }>
			<Header setIsOpen={ setIsOpen } />
			<CheckListWrapper />
		</Paper>
	);
};

export default Launchpad;

Launchpad.propTypes = {
	setIsOpen: PropTypes.func,
};
