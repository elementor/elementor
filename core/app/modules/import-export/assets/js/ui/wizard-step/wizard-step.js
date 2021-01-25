import Utils from 'elementor-app/utils/utils.js';

import Grid from 'elementor-app/ui/grid/grid';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './wizard-step.scss';

export default function WizardStep( props ) {
	const baseClassName = 'import-export-wizard-step',
		classes = [ baseClassName, props.className ];

	return (
		<>
			<Grid className={ Utils.arrayToClassName( classes ) } justify="center" container>
				<Grid item>
					{ props.image &&
					<Grid className="import-export-wizard-step__image-container" justify="center" alignItems="end" container>
						<img
							className="import-export-wizard-step__image"
							src={ props.image }
						/>
					</Grid>
					}

					{ props.icon &&
					<Icon className={ `import-export-wizard-step__icon ${ props.icon }` } />
					}

					{ props.title &&
					<Heading variant="display-3" className="import-export-wizard-step__title">
						{ props.title }
					</Heading>
					}

					{ props.text &&
					<Text variant="xl" className="import-export-wizard-step__text" >
						{ props.text }
					</Text>
					}

					{ props.bottomText &&
					<Text variant="xs" className="import-export-wizard-step__bottom-text">
						{ props.bottomText }
					</Text>
					}
				</Grid>
			</Grid>
		</>
	);
}

WizardStep.propTypes = {
	className: PropTypes.string,
	image: PropTypes.string,
	icon: PropTypes.string,
	title: PropTypes.string,
	text: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
	bottomText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
};

WizardStep.defaultProps = {
	className: '',
};
