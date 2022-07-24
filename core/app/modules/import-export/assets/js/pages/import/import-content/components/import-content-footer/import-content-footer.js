import { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';
import { SharedContext } from 'elementor/core/app/modules/import-export/assets/js/context/shared-context/shared-context-provider';

export default function ImportContentFooter( { hasPlugins, hasConflicts, isImportAllowed, onResetProcess, onPreviousClick, onImportClick } ) {
	const navigate = useNavigate(),
		sharedContext = useContext( SharedContext ),
		{ referrer, wizardStepNum } = sharedContext.data || {},

	getNextPageUrl = () => {
			if ( hasConflicts ) {
				return 'import/resolver';
			} else if ( hasPlugins ) {
				return 'import/plugins-activation';
			}

			return 'import/process';
		};
	useEffect( () => {
		sharedContext.dispatch( { type: 'SET_WIZARD_STEP', payload: wizardStepNum + 1 } );
	}, [] );
	return (
		<ActionsFooter>
			<Button
				text={ __( 'Previous', 'elementor' ) }
				variant="contained"
				onClick={ () => {
					if ( hasPlugins ) {
						sharedContext.dispatch( { type: 'SET_WIZARD_STEP_NUM', payload: wizardStepNum - 1 } );
						navigate( 'import/plugins/' );
					} else {
						onResetProcess();
					}
					if ( 'kit-library' === referrer && onPreviousClick ) {
						onPreviousClick();
					}
				} }
			/>

			<Button
				variant="contained"
				text={ __( 'Import', 'elementor' ) }
				color={ isImportAllowed ? 'primary' : 'disabled' }
				onClick={ () => {
					if ( 'kit-library' === referrer && onImportClick ) {
						onImportClick();
					}
					sharedContext.dispatch( { type: 'SET_WIZARD_STEP_NUM', payload: wizardStepNum + 1 } );
					return isImportAllowed && navigate( getNextPageUrl() );
				} }
			/>
		</ActionsFooter>
	);
}

ImportContentFooter.propTypes = {
	hasPlugins: PropTypes.bool,
	hasConflicts: PropTypes.bool,
	isImportAllowed: PropTypes.bool,
	onResetProcess: PropTypes.func.isRequired,
	onPreviousClick: PropTypes.func,
	onImportClick: PropTypes.func,
};
