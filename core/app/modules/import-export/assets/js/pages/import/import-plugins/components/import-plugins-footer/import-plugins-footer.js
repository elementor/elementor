import { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';
import { SharedContext } from '../../../../../context/shared-context/shared-context-provider';

import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

import useImportActions from '../../../hooks/use-import-actions';

export default function ImportPluginsFooter( props ) {
	const importContext = useContext( ImportContext ),
		sharedContext = useContext( SharedContext ),
		{ wizardStepNum } = sharedContext.data || {},
		{ navigateToMainScreen } = useImportActions();

	return (
		<ActionsFooter>
			<Button
				text={ __( 'Previous', 'elementor' ) }
				variant="contained"
				onClick={ () => {
					importContext.dispatch( { type: 'SET_FILE', payload: null } );
					sharedContext.dispatch( { type: 'SET_WIZARD_STEP_NUM', payload: wizardStepNum - 1 } );
					props.onPreviousClick?.();
					navigateToMainScreen();
				} }
			/>

			<Button
				variant="contained"
				text={ __( 'Next', 'elementor' ) }
				color="primary"
				url="/import/content"
				onClick={ () => {
					sharedContext.dispatch( { type: 'SET_WIZARD_STEP_NUM', payload: wizardStepNum + 1 } );
					props.onNextClick?.();
				} }
			/>
		</ActionsFooter>
	);
}

ImportPluginsFooter.propTypes = {
	onPreviousClick: PropTypes.func,
	onNextClick: PropTypes.func,
};
