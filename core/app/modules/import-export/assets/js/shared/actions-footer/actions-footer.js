import WizardFooter from '../../ui/wizard-step/wizard-step';

export default function ActionsFooter( props ) {
	return (
		<WizardFooter separator justify="end">
			{ props.children }
		</WizardFooter>
	);
}

ActionsFooter.propTypes = {
	children: PropTypes.any,
};
