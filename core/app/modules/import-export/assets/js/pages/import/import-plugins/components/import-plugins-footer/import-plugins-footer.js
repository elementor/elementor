import { useContext } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../../../context/shared-context/shared-context-provider';

import WizardFooter from 'elementor-app/organisms/wizard-footer';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportPluginsFooter() {
	const sharedContext = useContext( SharedContext ),
		navigate = useNavigate();

	return (
		<WizardFooter separator justify="end">
			<Button
				text={ __( 'Previous', 'elementor' ) }
				variant="contained"
				onClick={ () => {
					sharedContext.dispatch( { type: 'SET_FILE', payload: null } );

					navigate( '/import/' );
				} }
			/>

			<Button
				variant="contained"
				text={ __( 'Next', 'elementor' ) }
				color="primary"
				url="/import/content"
			/>
		</WizardFooter>
	);
}
