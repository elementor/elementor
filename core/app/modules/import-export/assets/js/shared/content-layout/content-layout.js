import './content-layout.scss';

export default function ContentLayout( props ) {
	return (
		<div className="e-app-import-export-content-layout">
			{ props.children }
		</div>
	);
}

ContentLayout.propTypes = {
	children: PropTypes.any.isRequired,
};
