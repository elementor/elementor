import { useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../../../context/context-provider';

import WizardFooter from 'elementor-app/organisms/wizard-footer';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportPluginsFooter() {
	const context = useContext( Context ),
		navigate = useNavigate();

	return (
		<WizardFooter separator justify="end">
			<Button
				text={ __( 'Previous', 'elementor' ) }
				variant="contained"
				onClick={ () => {
					context.dispatch( { type: 'SET_FILE', payload: null } );

					navigate( 'import/' );
				} }
			/>

			<Button
				variant="contained"
				text={ __( 'Next', 'elementor' ) }
				color="primary"
				onClick={ () => navigate( 'import/content' ) }
			/>
		</WizardFooter>
	);
}
