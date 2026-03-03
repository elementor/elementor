import { type V1Document } from '../../types';

export function makeDocumentsManager( documentsArray: V1Document[], current = 1, initial = current ) {
	const documents = documentsArray.reduce( ( acc: Record< number, V1Document >, document ) => {
		acc[ document.id ] = document;

		return acc;
	}, {} );

	return {
		documents,
		getCurrentId() {
			return current;
		},
		getInitialId() {
			return initial;
		},
		getCurrent() {
			return this.documents[ this.getCurrentId() ];
		},
		invalidateCache() {},
	};
}
