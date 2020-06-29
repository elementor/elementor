export const discardChanges = ( action, fullParams ) => {
	return {
		success: true,
		code: 200,
		data: true,
	};
};

export default discardChanges;
