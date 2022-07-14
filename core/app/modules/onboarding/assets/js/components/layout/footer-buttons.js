import Grid from 'elementor-app/ui/grid/grid';
import Button from '../button';
import SkipButton from '../skip-button';

export default function FooterButtons( { actionButton, skipButton, className } ) {
	let classNames = 'e-onboarding__footer';

	if ( className ) {
		classNames += ' ' + className;
	}

	return (
		<Grid container alignItems="center" justify="space-between" className={ classNames }>
			{ actionButton && <Button buttonSettings={ actionButton } type="action" /> }
			{ skipButton && <SkipButton button={ skipButton } /> }
		</Grid>
	);
}

FooterButtons.propTypes = {
	actionButton: PropTypes.object,
	skipButton: PropTypes.object,
	className: PropTypes.string,
};
