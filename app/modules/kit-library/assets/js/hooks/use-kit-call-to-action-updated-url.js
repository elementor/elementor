export default function useKitCallToActionUpdatedUrl( url, kitId, kitTitle ) {
	const cleanTitle = kitTitle.replace( /\s/g, '-' ).replace( /[^\w-]/g, '' ).toLowerCase();
	return url += `&utm_term=${ cleanTitle }&utm_content=${ kitId }`;
}

useKitCallToActionUpdatedUrl.prototype = {
	url: PropTypes.string.isRequired,
	kitId: PropTypes.number.isRequired,
	kitTitle: PropTypes.string.isRequired,
};
