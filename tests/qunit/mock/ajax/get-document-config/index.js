import documentInitial from '../../documents/document-1.json';
import documentKit from '../../documents/document-5.json';

// eslint-disable-next-line no-unused-vars
export const getDocumentConfig = ( action, fullParams ) => {
	if ( 1 === action.data.id ) {
		return {
			success: true,
			code: 200,
			data: documentInitial,
		};
	}

	if ( 5 === action.data.id ) {
		return {
			success: true,
			code: 200,
			data: documentKit,
		};
	}

	return {
		success: false,
		code: 500,
	};
};

export default getDocumentConfig;
