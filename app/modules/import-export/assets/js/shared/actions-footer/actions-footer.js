import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ActionsFooter( props ) {
	return (
		<WizardFooter separator justify="end" className={ props.className }>
			{ props.children }
		</WizardFooter>
	);
}

ActionsFooter.propTypes = {
	children: PropTypes.any,
	className: PropTypes.string,
};
