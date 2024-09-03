import Header from './header';
import CheckListWrapper from './checklist-wrapper';
import { useState } from 'react';
import { Paper } from '@elementor/ui';

const Checklist = ( props ) => {
	const [ steps, setSteps ] = useState( props.steps );

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
			<Header steps={ steps } />
			<CheckListWrapper steps={ steps } setSteps={ setSteps } />
		</Paper>
	);
};

Checklist.propTypes = {
	steps: PropTypes.array.isRequired,
};

export default Checklist;
