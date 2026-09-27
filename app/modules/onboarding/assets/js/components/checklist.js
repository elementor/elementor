export default function Checklist( props ) {
	return (
		<ul className="e-onboarding__checklist">
			{ props.children }
		</ul>
	);
}

Checklist.propTypes = {
	children: PropTypes.any.isRequired,
};
