const { expect } = require( '@playwright/test' );

class LibraryKits {
    constructor( page, url ) {
        this.page = page;
        this.url = url;
        this.randNum = Math.trunc( ( Math.random() * ( 30 ) ) + 40 );

        // WP Admin Dashboard
        this.templatesSection = this.page.locator( '#menu-posts-elementor_library' );
        this.kitLibraryInsideTemplatesSection = this.page.locator( '#menu-posts-elementor_library a >> text=Kit Library' );

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

    async goToKitPage() {
        await this.page.goto( '/wp-admin/', { waitUntil: 'load' } );
        await this.templatesSection.hover();
        await this.kitLibraryInsideTemplatesSection.click();
        await this.page.waitForLoadState( 'load' );
    }

    async checkBlogCategory() {
        await this.page.check( this.blogCategorySelector );
    }

    async checkFreePlan() {
        await this.page.check( this.freePlanSelector );
    }

    async checkProPlan() {
        await this.page.check( this.proPlanSelector );
    }

    async checkExpertPlan() {
        await this.page.check( this.expertPlanSelector );
    }

    async goToFavoritesPage() {
        await this.favoritesPage.click();
        await this.page.waitForLoadState( 'networkidle' );
    }

    async goToAllWebsiteKits() {
        await this.allWebsiteKits.click();
    }

    async selectSortoption( selectOption ) {
        await this.sortOptionsDropDown.selectOption( { value: selectOption } );
    }

    async checkAttorneyTag() {
        await this.page.check( this.attorneyTagSelector );
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
        await this.facoriteIcon.nth( kitIndex ).click();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForTimeout( 1000 );
        await this.goToFavoritesPage();
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForTimeout( 1000 );
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
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForTimeout( 2000 );
        const favoriteKits = await this.kitTitles.allTextContents();
        if ( favoriteKits.length > 0 ) {
            for ( let i = 0; i < favoriteKits.length; i++ ) {
                await this.favoriteKitsHeartIcon.nth( i ).click();
            }
        }
        await this.page.waitForLoadState( 'networkidle' );
        await this.page.waitForSelector( this.noFavoritesHereMessageSelector );
        await expect( this.noFavoritesHereMessage ).toContainText( noFiltersMessage );
    }

    async validateReverseSequence() {
        await this.page.waitForLoadState( 'networkidle' );
        const firstToLastOrder = await this.kitTitles.allTextContents();
        await this.sortFirstToLast.click();
        await this.page.waitForLoadState( 'networkidle' );
        const LastToFirstOrder = await this.kitTitles.allTextContents();
        await this.sortLastToFirst.click();
        await this.page.waitForLoadState( 'networkidle' );
        const backTOFirstToLastOrder = await this.kitTitles.allTextContents();
        await expect( firstToLastOrder ).toEqual( LastToFirstOrder.reverse() );
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
