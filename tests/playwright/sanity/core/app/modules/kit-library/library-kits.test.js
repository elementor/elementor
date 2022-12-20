const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../pages/wp-admin-page' );
const { GlobalUtils } = require( '../../../../../utils/global-utils' );
const { LibraryKits } = require( '../../../../../pages/library-kits-page' );
const testData = JSON.parse( JSON.stringify( require( './library-kits.data.json' ) ) );

test.beforeAll( async ( { browser }, testInfo ) => {
   const page = await browser.newPage();
   wpAdminHelper = new WpAdminPage( page, testInfo );
   globalHelper = new GlobalUtils();
   helper = new LibraryKits( page );
   await wpAdminHelper.setExperiments( {
      container: false,
   } );
} );

test.describe( 'Library Kits w/logged in State', () => {
   test( 'User can search using a category', async () => {
      await wpAdminHelper.goToKitPage();
      await helper.searchForBlogCategory();
      await expect( await helper.categoryItems.count() ).toEqual( 1 );
   } );

   test( 'User can filter by a category and then remove it', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await helper.checkBlogCategory();
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.blogKitNames );
      await globalHelper.checkTextIsNotPresentInArray( page, helper.kitTitles, testData.businessKitNames );

      // Remove the Blog Category Filter
      await helper.filterItemCloseButton.click();
      await expect( helper.blogCategory, `The blog category checkbox is still checked` ).not.toBeChecked();

      // All the kits are now again visible
      await expect( await helper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'User can search using a tag', async () => {
      await wpAdminHelper.goToKitPage();
      await helper.setTagsTheOnlyActiveSection();
      await helper.searchForCarsTag();
      await helper.checkOnlyCarTagIsAvailable();
   } );

   test( 'User can filter by a tag and then remove the tag', async () => {
      await wpAdminHelper.goToKitPage();
      await helper.setTagsTheOnlyActiveSection();
      await helper.checkoffAttorneyTag();
      await helper.checkAttorneyTagIsCheckedOff();
      await helper.checkOnlyAttorneyKitIsPresented( testData.attorneyTagKit[ 0 ] );
      await helper.uncheckTheAttorneyTag();
      await helper.checkTheAttorneyTagIsUnchecked();
      await helper.checkAllKitsAreNowPresent();
   } );

   test( 'User can clear all tags when there is multiple', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await helper.setTagsTheOnlyActiveSection();
      await helper.checkoffAttorneyTag();
      await helper.checkBlogTag();

      // All the kits with the Attorney tag and blog tag need to show up
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.blogKitNames.concat( testData.attorneyTagKit ) );

      await helper.selectClearAllFilters();

      // All the kits are now again visible and checked tags are not checked
      await expect( helper.attorneyTag ).not.toBeChecked();
      await expect( helper.blogTag ).not.toBeChecked();
      await expect( await helper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'Adding and removing a Kit to/from Favorites', async () => {
      await wpAdminHelper.goToKitPage();
      await helper.goToFavoritesPage();
      await helper.clearAllFavorites( testData.noFavoritesHereText );
      await helper.addKitToFavorites( testData.allCategoriesKitNames[ 1 ] );
      await helper.clearAllFavorites( testData.noFavoritesHereText );
      await expect( helper.noFavoritesHereMessage ).toContainText( testData.noFavoritesHereText );
   } );

   test( 'Reverse Sort Functionality in New Kits Works', async () => {
      await wpAdminHelper.goToKitPage();
      await helper.selectSortoption( testData.dropDownSortValues[ 1 ] );
      await helper.validateReverseSequence();
   } );

   test( 'User can collapse and expand the main categories', async () => {
      await wpAdminHelper.goToKitPage();
      await expect( await helper.expandedCategories.count() ).toEqual( 1 );
      await helper.categoriesTitle.click();
      await expect( await helper.expandedCategories.count() ).toEqual( 0 );
      await helper.tagsTitle.click();
      await expect( await helper.expandedCategories.count() ).toEqual( 1 );
      await helper.kitsByPlanTitle.click();
      await expect( await helper.expandedCategories.count() ).toEqual( 2 );
      await helper.categoriesTitle.click();
      await expect( await helper.expandedCategories.count() ).toEqual( 3 );
   } );

   test( 'User can search/select a kit and go back to library', async () => {
      await wpAdminHelper.goToKitPage();
      await helper.searchForKit( testData.top5MostPopularKits );
      await helper.checkSearchedKitIsPresent( testData.top5MostPopularKits );
      await helper.selectViewKitDemo();
      await helper.checkKitDemoHeading( testData.top5MostPopularKits[ 'Local Services Wireframe 2' ].pages.Home );
      await helper.selectBackToLibraryButton();
      await expect( helper.appTitle ).toContainText( testData.libraryAppTitle );
   } );

   test( 'User can filter by free plan', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await helper.categoriesTitle.click();
      await helper.kitsByPlanTitle.click();
      await helper.checkFreePlan();
      await page.waitForTimeout( 500 );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.freePlanKits );
      await globalHelper.checkTextIsNotPresentInArray( page, helper.kitTitles, testData.proPlanKits );
   } );

   test( 'User can filter by pro plan', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await helper.categoriesTitle.click();
      await helper.kitsByPlanTitle.click();
      await helper.checkProPlan();
      await page.waitForTimeout( 500 );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.proPlanKits );
      await globalHelper.checkTextIsNotPresentInArray( page, helper.kitTitles, testData.freePlanKits );
   } );

   test( 'User can do an overview of a kit and view one of the pages', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await helper.mainKitSearchEntryBox.type( Object.keys( testData.top5MostPopularKits )[ 1 ], { delay: 50 } );
      await page.waitForTimeout( 500 );
      await helper.viewKitDemo.click();
      await helper.selectOverviewButton();
      await helper.validateKitDescription( testData.top5MostPopularKits[ 'Bread Bakery' ].kitDescription );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitPageTitles, testData.top5MostPopularKits[ 'Bread Bakery' ].pages );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTags, testData.top5MostPopularKits[ 'Bread Bakery' ].tags );
      await helper.selectKitPage( Object.keys( testData.top5MostPopularKits[ 'Bread Bakery' ].pages )[ 3 ] );
      await helper.checkKitPageHeading( testData.top5MostPopularKits[ 'Bread Bakery' ].pages[ 'Contact Us' ] );
   } );

   test( 'User can sort by popularity of the kits', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await helper.selectSortoption( testData.dropDownSortValues[ 2 ] );
      await page.waitForTimeout( 500 );
      await helper.validateTop5PopularKits( Object.keys( testData.top5MostPopularKits ) );
   } );
} );
