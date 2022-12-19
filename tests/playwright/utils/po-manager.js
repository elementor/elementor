const { GlobalUtils } = require( './globalUtils' );
const { LibraryKits } = require( '../sanity/core/app/modules/kit-library/libraryKits.utils' );

class POManager {
    constructor( page, url ) {
        this.page = page;
        this.globalUtils = new GlobalUtils( page, url );
        this.libraryKits = new LibraryKits( page, url );
    }

    getGlobalUtils() {
        return this.globalUtils;
    }

    getLibraryKitsUtils() {
        return this.libraryKits;
    }
}

module.exports = { POManager };
