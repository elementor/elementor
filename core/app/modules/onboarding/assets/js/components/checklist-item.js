export default function ChecklistItem( props ) {
	return (
		<li className="e-onboarding__checklist-item">
			<i className="eicon-check-circle" />
			{ props.children }
		</li>
	);
}

ChecklistItem.propTypes = {
	children: PropTypes.string,
};
