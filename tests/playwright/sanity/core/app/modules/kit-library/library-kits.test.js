const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../pages/wp-admin-page' );
const { GlobalUtils } = require( '../../../../../utils/global-utils' );
const { LibraryKits } = require( '../../../../../pages/library-kits-page' );
const testData = JSON.parse( JSON.stringify( require( './library-kits.data.json' ) ) );

test.beforeAll( async ( { browser }, testInfo ) => {
   const page = await browser.newPage();
   wpAdminHelper = new WpAdminPage( page, testInfo );
   globalHelper = new GlobalUtils();
   kitLibraryHelper = new LibraryKits( page );
   await wpAdminHelper.setExperiments( {
      container: false,
   } );
} );

test.describe( 'Library Kits w/logged in State', () => {
   test( 'User can search using a category', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.searchForBlogCategory();
      await expect( await kitLibraryHelper.categoryItems.count() ).toEqual( 1 );
   } );

   test( 'User can filter by a category and then remove it', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.checkBlogCategory();
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.blogKitNames );
      await globalHelper.checkTextIsNotPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.businessKitNames );

      // Remove the Blog Category Filter
      await kitLibraryHelper.filterItemCloseButton.click();
      await expect( kitLibraryHelper.blogCategory, `The blog category checkbox is still checked` ).not.toBeChecked();

      // All the kits are now again visible
      await expect( await kitLibraryHelper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'User can search using a tag', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.setTagsTheOnlyActiveSection();
      await kitLibraryHelper.searchForTag( 'cars' );
      await kitLibraryHelper.checkOnlyOneCategoryItemIsPresented();
   } );

   test( 'User can filter by a tag and then remove the tag', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.setTagsTheOnlyActiveSection();
      await kitLibraryHelper.checkoffAttorneyTag();
      await kitLibraryHelper.checkAttorneyTagIsCheckedOff();
      await kitLibraryHelper.checkOnlyAttorneyKitIsPresented( testData.attorneyTagKit[ 0 ] );
      await kitLibraryHelper.uncheckTheAttorneyTag();
      await kitLibraryHelper.checkTheAttorneyTagIsUnchecked();
      await kitLibraryHelper.checkAllKitsAreNowPresent();
   } );

   test( 'User can clear all tags when there is multiple', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.setTagsTheOnlyActiveSection();
      await kitLibraryHelper.checkoffAttorneyTag();
      await kitLibraryHelper.checkBlogTag();

      // All the kits with the Attorney tag and blog tag need to show up
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.blogKitNames.concat( testData.attorneyTagKit ) );

      await kitLibraryHelper.selectClearAllFilters();

      // All the kits are now again visible and checked tags are not checked
      await expect( kitLibraryHelper.attorneyTag ).not.toBeChecked();
      await expect( kitLibraryHelper.blogTag ).not.toBeChecked();
      await expect( await kitLibraryHelper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'Adding and removing a Kit to/from Favorites', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.goToFavoritesPage();
      await kitLibraryHelper.clearAllFavorites( testData.noFavoritesHereText );
      await kitLibraryHelper.addKitToFavorites( testData.allCategoriesKitNames[ 1 ] );
      await kitLibraryHelper.clearAllFavorites( testData.noFavoritesHereText );
      await expect( kitLibraryHelper.noFavoritesHereMessage ).toContainText( testData.noFavoritesHereText );
   } );

   test( 'Reverse Sort Functionality in New Kits Works', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.selectSortoption( testData.dropDownSortValues[ 1 ] );
      await kitLibraryHelper.validateReverseSequence();
   } );

   test( 'User can collapse and expand the main categories', async () => {
      await wpAdminHelper.goToKitPage();
      await expect( await kitLibraryHelper.expandedCategories.count() ).toEqual( 1 );
      await kitLibraryHelper.categoriesTitle.click();
      await expect( await kitLibraryHelper.expandedCategories.count() ).toEqual( 0 );
      await kitLibraryHelper.tagsTitle.click();
      await expect( await kitLibraryHelper.expandedCategories.count() ).toEqual( 1 );
      await kitLibraryHelper.kitsByPlanTitle.click();
      await expect( await kitLibraryHelper.expandedCategories.count() ).toEqual( 2 );
      await kitLibraryHelper.categoriesTitle.click();
      await expect( await kitLibraryHelper.expandedCategories.count() ).toEqual( 3 );
   } );

   test( 'User can search/select a kit and go back to library', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.searchForKit( testData.top5MostPopularKits );
      await kitLibraryHelper.checkSearchedKitIsPresent( testData.top5MostPopularKits );
      await kitLibraryHelper.selectViewKitDemo();
      await kitLibraryHelper.checkKitDemoHeading( testData.top5MostPopularKits[ 'Local Services Wireframe 2' ].pages.Home );
      await kitLibraryHelper.selectBackToLibraryButton();
      await expect( kitLibraryHelper.appTitle ).toContainText( testData.libraryAppTitle );
   } );

   test( 'User can filter by free plan', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.categoriesTitle.click();
      await kitLibraryHelper.kitsByPlanTitle.click();
      await kitLibraryHelper.checkFreePlan();
      await page.waitForTimeout( 500 );
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.freePlanKits );
      await globalHelper.checkTextIsNotPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.proPlanKits );
   } );

   test( 'User can filter by pro plan', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.categoriesTitle.click();
      await kitLibraryHelper.kitsByPlanTitle.click();
      await kitLibraryHelper.checkProPlan();
      await page.waitForTimeout( 500 );
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.proPlanKits );
      await globalHelper.checkTextIsNotPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.freePlanKits );
   } );

   test( 'User can do an overview of a kit and view one of the pages', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.mainKitSearchEntryBox.type( Object.keys( testData.top5MostPopularKits )[ 1 ], { delay: 50 } );
      await page.waitForTimeout( 500 );
      await kitLibraryHelper.viewKitDemo.click();
      await kitLibraryHelper.selectOverviewButton();
      await kitLibraryHelper.validateKitDescription( testData.top5MostPopularKits[ 'Bread Bakery' ].kitDescription );
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitPageTitles, testData.top5MostPopularKits[ 'Bread Bakery' ].pages );
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTags, testData.top5MostPopularKits[ 'Bread Bakery' ].tags );
      await kitLibraryHelper.selectKitPage( Object.keys( testData.top5MostPopularKits[ 'Bread Bakery' ].pages )[ 3 ] );
      await kitLibraryHelper.checkKitPageHeading( testData.top5MostPopularKits[ 'Bread Bakery' ].pages[ 'Contact Us' ] );
   } );

   test( 'User can sort by popularity of the kits', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.selectSortoption( testData.dropDownSortValues[ 2 ] );
      await page.waitForTimeout( 500 );
      await kitLibraryHelper.validateTop5PopularKits( Object.keys( testData.top5MostPopularKits ) );
   } );
} );
