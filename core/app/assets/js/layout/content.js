export default function Content( props ) {
	return (
		<main className="eps-app__content">
			{ props.children }
		</main>
	);
}

Content.propTypes = {
	children: PropTypes.object,
};
