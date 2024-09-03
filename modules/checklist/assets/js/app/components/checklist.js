import Header from './header';
import CheckListWrapper from './checklist-wrapper';
import { Paper } from '@elementor/ui';

const Checklist = ( { steps } ) => {
	return (
		<Paper elevation={ 5 } className="e-checklist-popup" sx={ {
			position: 'fixed',
			width: '360px',
			bottom: '40px',
			insetInlineEnd: '40px',
			zIndex: '99999',
			hidden: true,
			maxHeight: '645px',
			overflowY: 'auto',
		} }>
			<Header steps={ steps } />
			<CheckListWrapper steps={ steps } />
		</Paper>
	);
};

Checklist.propTypes = {
	steps: PropTypes.array.isRequired,
};

export default Checklist;
