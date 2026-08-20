export default function Notice( props ) {
	return (
		<div className={ `e-onboarding__notice e-onboarding__notice--${ props.noticeState.type }` }>
			<i className={ props.noticeState.icon } />
			<span className="e-onboarding__notice-text">{ props.noticeState.message }</span>
		</div>
	);
}

Notice.propTypes = {
	noticeState: PropTypes.object,
};
