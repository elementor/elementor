const CHECK_COPY = {};

export const getCheckCopy = ( checkId ) => CHECK_COPY[ checkId ] ?? {};

export const getCheckTitle = ( checkId, label, isPassing ) => {
	const copy = getCheckCopy( checkId );
	const title = isPassing ? copy.passingTitle : copy.failingTitle;

	return title || label;
};
