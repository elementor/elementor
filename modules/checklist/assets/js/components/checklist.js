import Header from './header';
import CheckListWrapper from './checklist-wrapper';
import { Paper } from '@elementor/ui';

const Checklist = () => {
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
			<Header />
			<CheckListWrapper />
		</Paper>
	);
};

export default Checklist;
