const Context = React.createContext();

export function AppLayoutRefsProvider( props ) {
	const refs = {
		pageRef: React.useRef(),
		contentRef: React.useRef(),
	};

	return (
		<Context.Provider value={refs}>
			{ props.children }
		</Context.Provider>
	);
}

AppLayoutRefsProvider.propTypes = {
	children: PropTypes.any,
};

export function useAppLayoutRefs() {
	return React.useContext( Context );
}
