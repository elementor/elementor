import Header from './header';
import CheckListWrapper from './checklist-wrapper';
import { useState } from 'react';
import { Paper } from '@elementor/ui';
import { USER_PROGRESS, USER_PROGRESS_ROUTE } from '../../utils/consts';

const { IS_POPUP_MINIMIZED } = USER_PROGRESS;

const Checklist = ( props ) => {
	const [ steps, setSteps ] = useState( props.steps ),
		[ isMinimized, setIsMinimized ] = useState( !! props.userProgress[ IS_POPUP_MINIMIZED ] );

	const toggleIsMinimized = async () => {
		const currState = isMinimized;

		try {
			setIsMinimized( ! currState );

			await $e.data.update( USER_PROGRESS_ROUTE, {
				[ IS_POPUP_MINIMIZED ]: ! currState,
			} );
		} catch ( e ) {
			setIsMinimized( currState );
		}
	};

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
			<Header steps={ steps } isMinimized={ isMinimized } toggleIsMinimized={ toggleIsMinimized } />
			<CheckListWrapper steps={ steps } setSteps={ setSteps } isMinimized={ isMinimized } />
		</Paper>
	);
};

Checklist.propTypes = {
	steps: PropTypes.array.isRequired,
	userProgress: PropTypes.object.isRequired,
};

export default Checklist;
