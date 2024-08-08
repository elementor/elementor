import CheckList from './checklist';
import Header from './header';
import Paper from '@elementor/ui/Paper';

const Launchpad = ( props ) => {
	const { isOpen, setIsOpen } = props;

	return (
		<Paper elevation={ 5 } sx={ {
			position: 'fixed',
			width: '360px',
			bottom: '40px',
			right: '40px',
			zIndex: '99999',
			hidden: true,
			maxHeight: '645px',
			overflowY: 'auto',
		} }>
			<Header
				isOpen={ isOpen }
				setIsOpen={ setIsOpen }
			/>
			<CheckList />
		</Paper>
	);
};

export default Launchpad;

Launchpad.propTypes = {
	setIsOpen: PropTypes.func,
	isOpen: PropTypes.bool
};
