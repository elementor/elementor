import Grid from 'elementor-app/ui/grid/grid';
import Button from '../button';
import SkipButton from '../skip-button';

export default function FooterButtons( props ) {
	const { actionButton, skipButton } = props,
		maybeGetActionButton = () => {
			if ( actionButton ) {
				return <Button button={ actionButton } type="action"/>;
			}

			return null;
		},
		maybeGetSkipButton = () => {
			if ( skipButton ) {
				return <SkipButton button={ skipButton }/>;
			}

			return null;
		};

	let classNames = 'e-onboarding__footer';

	if ( props.className ) {
		classNames += ' ' + props.className;
	}

	return (
		<Grid container alignItems="center" justify="space-between" className={ classNames }>
			{ maybeGetActionButton() }
			{ maybeGetSkipButton() }
		</Grid>
	);
}

FooterButtons.propTypes = {
	actionButton: PropTypes.object,
	skipButton: PropTypes.object,
	className: PropTypes.string,
};
