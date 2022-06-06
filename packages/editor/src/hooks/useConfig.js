const useConfig = ( ...args ) => {

	return args.map( ( arg ) => {
		return window.elementor.getConfig()[ arg ];
	} );
}

export default useConfig;
