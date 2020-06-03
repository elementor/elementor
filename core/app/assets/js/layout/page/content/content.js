export default function Content( props ) {
	return (
		<main className="e-app__content">
			{ props.children }
		</main>
	);
}

Content.propTypes = {
	children: PropTypes.object,
};
