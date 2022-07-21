import { useEffect, useContext } from 'react';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ActionsFooter( props ) {
	useEffect( () => {
		{ console.log( 'step: ', props ) }
	}, [] )
	return (
		<WizardFooter separator justify="end">
			{ props.children }
		</WizardFooter>
	);
}

ActionsFooter.propTypes = {
	children: PropTypes.any,
};
