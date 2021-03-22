export const reducer = ( state, action ) => {
	switch ( action.type ) {
		case 'SET_FILE':
			return { ...state, file: action.payload };
		default:
			return state;
	}
};
