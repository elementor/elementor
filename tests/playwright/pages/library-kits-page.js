const { expect } = require( '@playwright/test' );

class LibraryKits {
    constructor( page, url ) {
        this.page = page;
        this.url = url;
        this.randNum = Math.trunc( ( Math.random() * ( 30 ) ) + 40 );

        // Kit Library
        this.appTitle = this.page.locator( '.eps-app__title' );
        this.kitTitles = this.page.locator( '.eps-h5' );
        this.kitTitlesSelector = '.eps-h5';
        this.categoryItems = this.page.locator( "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] .e-kit-library__tags-filter-list-item" );
        this.categoryItemsSelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] .e-kit-library__tags-filter-list-item";
        this.allWebsiteKits = this.page.locator( '#eps-menu-item- .eicon-filter' );
        this.filterItemCloseButton = this.page.locator( '.eicon-editor-close' );
        this.mainKitSearchEntryBox = this.page.locator( '.eps-search-input--md' );
        this.viewKitDemo = this.page.locator( '.e-kit-library__kit-item-overlay-overview-button' );

        // Favorites
        this.facoriteIcon = this.page.locator( '.e-kit-library__kit-favorite-actions i' );
        this.favoritesPage = this.page.locator( '#eps-menu-item- .eicon-heart-o' );
        this.favoriteKitsHeartIcon = this.page.locator( '.eicon-heart' );
        this.noFavoritesHereMessage = this.page.locator( '.e-kit-library__error-screen-title' );
        this.noFavoritesHereMessageSelector = '.e-kit-library__error-screen-title';
        this.sortOptionsDropDown = this.page.locator( '.eps-sort-select__select' );

        // Sorting
        this.sortFirstToLast = this.page.locator( '.eicon-arrow-down' );
        this.sortLastToFirst = this.page.locator( '.eicon-arrow-up' );

        // Categories
        this.expandedCategories = this.page.locator( "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true']" );
        this.categoriesTitle = this.page.locator( 'div.eps-collapse.e-kit-library__tags-filter-list .eps-collapse__title span >> text=Categories' );
        this.tagsTitle = this.page.locator( 'div.eps-collapse.e-kit-library__tags-filter-list .eps-collapse__title span >> text=Tags' );
        this.kitsByPlanTitle = this.page.locator( 'div.eps-collapse.e-kit-library__tags-filter-list .eps-collapse__title span >> text=Kits by plan' );
        this.searchCategoriesEntryBox = this.page.locator( '[placeholder="Search Categories..."]' );
        this.blogCategory = this.page.locator( "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Blog" );
        this.blogCategorySelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Blog";
        this.categorySelector = this.page.locator( 'div.eps-collapse.e-kit-library__tags-filter-list[data-open="true"] .eps-checkbox' );

        // Kits by Plans
        this.freePlanSelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Free";
        this.proPlanSelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Pro";
        this.expertPlanSelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Expert";

        // Tags
        this.searchTagsEntryBox = this.page.locator( '[placeholder="Search Tags..."]' );
        this.searchTagsEntryBoxSelector = '[placeholder="Search Tags..."]';
        this.attorneyTag = this.page.locator( "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Attorney" );
        this.attorneyTagSelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Attorney";
        this.blogTag = this.page.locator( "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Blog" ).nth( 0 );
        this.blogTagSelector = "div.eps-collapse.e-kit-library__tags-filter-list[data-open='true'] label >> text=Blog";

        // KitDemo
        this.kitH1 = page.frameLocator( '.e-kit-library__preview-iframe' ).locator( 'xpath=//h1' );

        // KitOverview
        this.kitPageTitles = this.page.locator( 'h3.eps-h5' );
        this.kitTags = this.page.locator( '.e-kit-library__item-sidebar-tags-container span' );
        this.kitPage = this.page.locator( '.e-kit-library__kit-item-overlay-overview-button' );
    }

    async checkBlogCategory() {
        await this.page.check( this.blogCategorySelector );
        await this.page.waitForSelector( '.e-kit-library__filter-indication-text' );
    }

    async removeBlogCategoryFilter() {
        await this.filterItemCloseButton.click();
    }

    async checBlogCategoryCheckBoxIsUnchecked() {
        await expect( this.blogCategory, `The blog category checkbox is still checked` ).not.toBeChecked();
    }

    async setTagsTheOnlyActiveSection() {
        await this.categoriesTitle.click();
        await this.tagsTitle.click();
        await this.page.waitForSelector( this.searchTagsEntryBoxSelector );
    }

    async searchForTag( categoryName ) {
        // Type a tag fully and validate that there is only one tag thats available for selection
        await this.searchTagsEntryBox.type( categoryName, { delay: 50 } );
        await this.page.waitForSelector( '.eicon-close-circle' );
        await expect( await this.categoryItems.count(), `The search for "cars" tag was not found` ).toEqual( 1 );
    }

    async searchForBlogCategory() {
        await this.searchCategoriesEntryBox.type( 'blog', { delay: 50 } );
        await this.page.waitForSelector( '.e-kit-library__tags-filter-list-search .eps-search-input__clear-icon' );
    }

    async checkOnlyOneCategoryItemIsPresented() {
        await expect( await this.categoryItems.count(), `The search for "cars" tag was not found` ).toEqual( 1 );
    }

    async checkoffAttorneyTag() {
        await this.attorneyTag.click();
        await this.page.waitForSelector( '.e-kit-library__filter-indication-text' );
    }

    async checkAttorneyTagIsCheckedOff() {
        await expect( this.attorneyTag ).toBeChecked();
    }

    async checkOnlyAttorneyKitIsPresented( kit ) {
        // Only 1 Kit is supposed to show up with an Attorney tag
        await expect( this.kitTitles, `Law Firm Kit is not showing in the available kits` ).toContainText( kit );
    }

    async uncheckTheAttorneyTag() {
        await this.filterItemCloseButton.click();
    }

    async checkTheAttorneyTagIsUnchecked() {
        await expect( this.attorneyTag, `The attorney tag checkbox is still checked` ).not.toBeChecked();
    }

    async checkCheckBoxIsUnchecked( selector ) {
        await expect( selector, `The attorney tag checkbox is still checked` ).not.toBeChecked();
    }

    async checkAllKitsAreNowPresent() {
        await expect( await this.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
    }

    async searchForKit( kit ) {
        await this.mainKitSearchEntryBox.type( Object.keys( kit )[ 0 ], { delay: 50 } );
        await this.page.waitForSelector( '.e-kit-library__index-layout-top-area-search .eps-search-input__clear-icon' );
    }

    async selectViewKitDemo() {
        await this.viewKitDemo.click();
        await this.page.waitForSelector( '#eps-app-header-btn-connect' );
    }

    async checkKitDemoHeading( kit ) {
        await expect( this.kitH1 ).toContainText( kit );
    }

    async checkSearchedKitIsPresent( kit ) {
        const kitslist = await this.kitTitles.allTextContents();
        await expect( kitslist.includes( Object.keys( kit )[ 0 ] ) ).toBeTruthy();
    }

    async checkFreePlan() {
        await this.page.check( this.freePlanSelector );
        await this.page.waitForSelector( '.e-kit-library__filter-indication .e-kit-library__filter-indication-text' );
    }

    async checkProPlan() {
        await this.page.check( this.proPlanSelector );
        await this.page.waitForSelector( '.e-kit-library__filter-indication .e-kit-library__filter-indication-text' );
    }

    async enterKitName( text ) {
        await this.mainKitSearchEntryBox.type( text, { delay: 50 } );
        await this.page.waitForSelector( '.e-kit-library__index-layout-top-area-search .eicon-close-circle' );
    }

    async checkExpertPlan() {
        await this.page.check( this.expertPlanSelector );
    }

    async goToFavoritesPage() {
        await this.favoritesPage.click();
        await this.page.waitForNavigation();
    }

    async identifyFavoriteKitsAndCheckThemInFavorites() {
        const favoriteKitsList = [];
        const kitQuantity = await this.page.locator( '.eps-card__header  div' ).count();
        for ( let i = 0; i < kitQuantity; i++ ) {
            if ( 'eps-button e-kit-library__kit-favorite-actions e-kit-library__kit-favorite-actions--active ' === await this.page.locator( '.eps-card__header  div' ).nth( i ).getAttribute( 'class' ) ) {
                await favoriteKitsList.push( await this.page.locator( '.eps-card__header  h3' ).nth( i ).textContent() );
            }
        }
        await this.goToFavoritesPage();

        const favoritesPageKits = await this.page.locator( '.eps-card__header h3' ).allTextContents();
        await expect( favoritesPageKits.length ).toEqual( favoriteKitsList.length );
    }

    async goToAllWebsiteKits() {
        await this.allWebsiteKits.click();
    }

    async selectSortoption( selectOption ) {
        await this.sortOptionsDropDown.selectOption( { value: selectOption } );
    }

    async checkBlogTag() {
        await this.page.check( this.blogTagSelector );
    }

    async selectClearAllFilters() {
        await this.page.locator( '.e-kit-library__filter-indication-button span' ).click();
    }

    async selectBackToLibraryButton() {
        await this.page.locator( '.e-kit-library__header-back' ).click();
    }

    async selectOverviewButton() {
        await this.page.locator( '#eps-app-header-btn-overview' ).click();
    }

    async validateKitDescription( descriptionText ) {
        await expect( this.page.locator( '.e-kit-library__item-sidebar-description' ) ).toContainText( descriptionText );
    }

    async checkKitPageHeading( headingText ) {
        await expect( this.kitH1 ).toContainText( headingText );
    }

    async addKitToFavorites( kitName ) {
        await this.page.waitForLoadState( 'networkidle' );
        await this.goToAllWebsiteKits();
        await this.page.waitForSelector( this.kitTitlesSelector );
        const kitTitlesList = await this.kitTitles.allTextContents();
        const kitIndex = kitTitlesList.indexOf( kitName );
        await Promise.all( [
            this.page.waitForResponse( ( response ) => response.url().includes( '/kits/favorites/' ) && 200 === response.status() ),
            await this.facoriteIcon.nth( kitIndex ).click(),
        ] );
        await this.goToFavoritesPage();
        await this.page.waitForSelector( this.kitTitlesSelector );
        const kitsOnFavoritePage = await this.kitTitles.allTextContents();
        await expect( kitsOnFavoritePage.toString().includes( kitName ), `Kit: ${ kitName } is not in the favorites` ).toEqual( true );
    }

    async selectKitPage( pageName ) {
        const kitPageList = await this.kitPageTitles.allTextContents();
        const kitIndex = kitPageList.indexOf( pageName );
        await this.kitPage.nth( kitIndex ).click();
    }

    async clearAllFavorites( noFiltersMessage ) {
        const favoriteKits = await this.kitTitles.allTextContents();
        if ( favoriteKits.length > 0 ) {
            for ( let i = 0; i < favoriteKits.length; i++ ) {
                await this.favoriteKitsHeartIcon.nth( i ).click();
            }
        }
        await this.page.waitForSelector( this.noFavoritesHereMessageSelector );
        await expect( this.noFavoritesHereMessage ).toContainText( noFiltersMessage );
    }

    async validateReverseSequence() {
        await this.page.waitForLoadState( 'networkidle' );
        const firstToLastOrder = await this.kitTitles.allTextContents();
        await this.sortFirstToLast.click();
        await this.page.waitForLoadState( 'networkidle' );
        const lastToFirstOrder = await this.kitTitles.allTextContents();
        await this.sortLastToFirst.click();
        await this.page.waitForLoadState( 'networkidle' );
        const backTOFirstToLastOrder = await this.kitTitles.allTextContents();
        await expect( firstToLastOrder ).toEqual( lastToFirstOrder.reverse() );
        await expect( firstToLastOrder ).toEqual( backTOFirstToLastOrder );
    }

    async validateTop5PopularKits( data ) {
        // Grab the top 5 Kits
        const top5KitTitles = [];
        for ( let i = 0; i < 5; i++ ) {
            const top5KitNames = await this.kitTitles.nth( i ).textContent();
            top5KitTitles.push( top5KitNames );
        }

        // Validate the kits against the list of the top 5 kits
        for ( let k = 0; k < 4; k++ ) {
            await expect( data.includes( top5KitTitles[ k ] ), `${ top5KitTitles[ k ] } is not included in the top 5 kits` ).toBeTruthy();
        }
    }
}

module.exports = { LibraryKits };
