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

test.describe.only( 'Library Kits w/logged in State', () => {
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
      await kitLibraryHelper.removeBlogCategoryFilter();
      await kitLibraryHelper.checBlogCategoryCheckBoxIsUnchecked();
      await kitLibraryHelper.checkAllKitsAreNowPresent();
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
      await kitLibraryHelper.checkCheckBoxIsUnchecked( kitLibraryHelper.attorneyTag );
      await kitLibraryHelper.checkAllKitsAreNowPresent();
   } );

   test( 'User can clear all tags when there is multiple', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.setTagsTheOnlyActiveSection();
      await kitLibraryHelper.checkoffAttorneyTag();
      await kitLibraryHelper.checkBlogTag();
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.blogKitNames.concat( testData.attorneyTagKit ) );
      await kitLibraryHelper.selectClearAllFilters();
      await kitLibraryHelper.checkCheckBoxIsUnchecked( kitLibraryHelper.attorneyTag );
      await kitLibraryHelper.checkCheckBoxIsUnchecked( kitLibraryHelper.blogTag );
      await kitLibraryHelper.checkAllKitsAreNowPresent();
   } );

   test( 'Adding and removing a Kit to/from Favorites', async () => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.identifyFavoriteKitsAndCheckThemInFavorites();
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
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.freePlanKits );
      await globalHelper.checkTextIsNotPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.proPlanKits );
   } );

   test( 'User can filter by pro plan', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.categoriesTitle.click();
      await kitLibraryHelper.kitsByPlanTitle.click();
      await kitLibraryHelper.checkProPlan();
      await globalHelper.checkTextIsPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.proPlanKits );
      await globalHelper.checkTextIsNotPresentInInSelectorElements( page, kitLibraryHelper.kitTitles, testData.freePlanKits );
   } );

   test( 'User can do an overview of a kit and view one of the pages', async ( { page } ) => {
      await wpAdminHelper.goToKitPage();
      await kitLibraryHelper.enterKitName( Object.keys( testData.top5MostPopularKits )[ 1 ] );
      await kitLibraryHelper.selectViewKitDemo();
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
      await page.waitForLoadState( 'networkidle' );
      await kitLibraryHelper.validateTop5PopularKits( Object.keys( testData.top5MostPopularKits ) );
   } );
} );
