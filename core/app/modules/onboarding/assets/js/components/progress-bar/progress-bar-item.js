import { useContext } from 'react';
import { OnboardingContext } from '../../context/context';

export default function ProgressBarItem( props ) {
	const { state } = useContext( OnboardingContext ),
		stepCompleted = 'completed' === state.steps[ props.id ],
		stepSkipped = 'skipped' === state.steps[ props.id ];

	let itemClasses = 'e-onboarding__progress-bar-item';

	if ( props.id === state.currentStep ) {
		itemClasses += ' e-onboarding__progress-bar-item--active';
	} else if ( stepCompleted ) {
		itemClasses += ' e-onboarding__progress-bar-item--completed';
	} else if ( stepSkipped ) {
		itemClasses += ' e-onboarding__progress-bar-item--skipped';
	}

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div onClick={ props.onClick } className={ itemClasses }>
			<div className="e-onboarding__progress-bar-item-icon">
				{ stepCompleted ? <i className="eicon-check" /> : props.index + 1 }
			</div>
			{ props.title }
		</div>
	);
}

ProgressBarItem.propTypes = {
	index: PropTypes.number.isRequired,
	id: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	route: PropTypes.string,
	onClick: PropTypes.func,
};
