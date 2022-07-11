import { useContext } from 'react';
import { OnboardingContext } from '../../context/context';
import Grid from 'elementor-app/ui/grid/grid';
import Notice from '../notice';
import FooterButtons from './footer-buttons';

export default function PageContentLayout( props ) {
	const { state } = useContext( OnboardingContext );

	const printNotices = () => {
		return (
			<>
				{ props.noticeState && <Notice noticeState={ props.noticeState } /> }
				{ state.proNotice && <Notice noticeState={ state.proNotice } /> }
			</>
		);
	};

	return (
		<>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__page-content">
				<div className="e-onboarding__page-content-start">
					<h1 className="e-onboarding__page-content-section-title">
						{ props.title }
					</h1>
					<div className="e-onboarding__page-content-section-text">
						{ props.children }
					</div>
				</div>
				<div className="e-onboarding__page-content-end">
					<img src={ props.image } alt="Information" />
				</div>
			</Grid>
			<div className="e-onboarding__notice-container">
				{ props.noticeState || state.proNotice
					? printNotices()
					: <div className="e-onboarding__notice-empty-spacer" /> }
			</div>
			<FooterButtons actionButton={ props.actionButton } skipButton={ props.skipButton } />
		</>
	);
}

PageContentLayout.propTypes = {
	title: PropTypes.string,
	children: PropTypes.any,
	image: PropTypes.string,
	actionButton: PropTypes.object,
	skipButton: PropTypes.object,
	noticeState: PropTypes.any,
};
