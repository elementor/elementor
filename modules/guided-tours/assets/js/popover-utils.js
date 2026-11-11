export const formatProgressText = ( template, current, total ) => {
	return template.replace( '%1$s', current ).replace( '%2$s', total );
};

export const getPopoverSide = ( side ) => {
	if ( 'rtl' !== document.documentElement.dir ) {
		return side;
	}

	return {
		left: 'right',
		right: 'left',
	}[ side ] ?? side;
};

export const isValidSelector = ( selector ) => {
	try {
		document.querySelector( selector );
		return true;
	} catch ( error ) {
		return false;
	}
};
