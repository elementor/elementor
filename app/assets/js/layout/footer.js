export default function Footer( props ) {
	return (
		<footer className="eps-app__footer">
			{ props.children }
		</footer>
	);
}

Footer.propTypes = {
	children: PropTypes.object,
};
