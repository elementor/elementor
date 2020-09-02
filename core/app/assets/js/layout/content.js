const Content = React.forwardRef( ( props, ref ) => {
	return (
		<main className="eps-app__content" ref={ ref }>
			{ props.children }
		</main>
	);
} );

Content.propTypes = {
	children: PropTypes.object,
};

Content.displayName = 'Content';

export default Content;
