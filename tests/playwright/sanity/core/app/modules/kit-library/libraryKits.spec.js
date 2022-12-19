const { test, expect } = require( '@playwright/test' );
const { POManager } = require( '../../../../../utils/po-manager' );
const testData = JSON.parse( JSON.stringify( require( './libraryKits.data.json' ) ) );

var poManager = {};
var globalHelper = {};
var helper = {};

test.beforeEach( async ( { page } ) => {
   poManager = new POManager( page );
   globalHelper = poManager.getGlobalUtils( page );
   helper = poManager.getLibraryKitsUtils( page );
 } );

 test.beforeAll( async ( { browser }, testInfo ) => {
	const page = await browser.newPage();
   poManager = new POManager( page );
   globalHelper = poManager.getGlobalUtils( page, testInfo.project.use.baseURL );
	await globalHelper.gotoExperiments();
	await globalHelper.checkflexBoxIsOff();
 } );

test.describe( 'Library Kits w/logged in State', () => {
   test( 'User can search using a category', async ( { page } ) => {
      await helper.goToKitPage();
      await helper.searchCategoriesEntryBox.type( 'blog', { delay: 50 } );
      await page.waitForLoadState( 'networkidle' );
      await page.waitForTimeout( 500 );
      await expect( await helper.categoryItems.count() ).toEqual( 1 );
   } );

   test( 'User can filter by a category and then remove it', async ( { page } ) => {
      await helper.goToKitPage();
      await helper.checkBlogCategory();
      await page.waitForLoadState( 'networkidle' );
      await page.waitForTimeout( 3000 );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.blogKitNames );
      await globalHelper.checkTextIsNotPresentInArray( page, helper.kitTitles, testData.businessKitNames );

      // Remove the Blog Category Filter
      await helper.filterItemCloseButton.click();
      await expect( helper.blogCategory, `The blog category checkbox is still checked` ).not.toBeChecked();

      // All the kits are now again visible
      await expect( await helper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'User can search using a tag', async ( { page } ) => {
      await helper.goToKitPage();

      // Make "Tags" the only section that is not callapsed
      await helper.categoriesTitle.click();
      await helper.tagsTitle.click();

      // Type a tag fully and validate that there is only one tag thats available for selection
      await page.waitForSelector( helper.searchTagsEntryBoxSelector );
      await helper.searchTagsEntryBox.type( 'cars', { delay: 50 } );
      await page.waitForTimeout( 500 );
      await expect( await helper.categoryItems.count(), `The search for "cars" tag was not found` ).toEqual( 1 );
   } );

   test( 'User can filter by a tag and then remove the tag', async ( { page } ) => {
      await helper.goToKitPage();

      // Make Tags the Only Category thats not callapsed
      await helper.categoriesTitle.click();
      await helper.tagsTitle.click();

      await helper.checkAttorneyTag();
      await expect( helper.attorneyTag ).toBeChecked();
      await page.waitForTimeout( 500 );

      // Only 1 Kit is supposed to show up with an Attorney tag
      await expect( helper.kitTitles, `Law Firm Kit is not showing in the available kits` ).toContainText( testData.attorneyTagKit[ 0 ] );

      // Remove the Attorney Tag
      await helper.filterItemCloseButton.click();
      await expect( helper.attorneyTag, `The attorney tag checkbox is still checked` ).not.toBeChecked();

      // All the kits are now again visible
      await expect( await helper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'User can clear all tags when there is multiple', async ( { page } ) => {
      await helper.goToKitPage();

      // Make Tags the Only Category thats not callapsed
      await helper.categoriesTitle.click();
      await helper.tagsTitle.click();

      await helper.checkAttorneyTag();
      await expect( helper.attorneyTag ).toBeChecked();
      await helper.checkBlogTag();
      await expect( helper.blogTag ).toBeChecked();
      await page.waitForTimeout( 500 );

      // All the kits with the Attorney tag and blog tag need to show up
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.blogKitNames.concat( testData.attorneyTagKit ) );

      await helper.selectClearAllFilters();

      // All the kits are now again visible and checked tags are not checked
      await expect( helper.attorneyTag ).not.toBeChecked();
      await expect( helper.blogTag ).not.toBeChecked();
      await expect( await helper.kitTitles.count(), `All the kits are not back into view after filter is cleared` ).toBeGreaterThan( 50 );
   } );

   test( 'Adding and removing a Kit to/from Favorites', async () => {
      await helper.goToKitPage();
      await helper.goToFavoritesPage();
      await helper.clearAllFavorites( testData.noFavoritesHereText );
      await helper.addKitToFavorites( testData.allCategoriesKitNames[ 1 ] );
      await helper.clearAllFavorites( testData.noFavoritesHereText );
      await expect( helper.noFavoritesHereMessage ).toContainText( testData.noFavoritesHereText );
   } );

   test( 'Reverse Sort Functionality in New Kits Works', async () => {
      await helper.goToKitPage();
      await helper.selectSortoption( testData.dropDownSortValues[ 1 ] );
      await helper.validateReverseSequence();
   } );

   test( 'User can collapse and expand the main categories', async ( { page } ) => {
      await helper.goToKitPage();
      await page.waitForLoadState( 'networkidle' );

      // At Initial Load all three categories should be expanded
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

   test( 'User can search/select a kit and go back to library', async ( { page } ) => {
      await helper.goToKitPage();
      await page.waitForLoadState( 'networkidle' );
      await helper.mainKitSearchEntryBox.type( Object.keys( testData.top5MostPopularKits )[ 0 ], { delay: 50 } );
      await page.waitForTimeout( 500 );
      const kitslist = await helper.kitTitles.allTextContents();
      await expect( kitslist.includes( Object.keys( testData.top5MostPopularKits )[ 0 ] ) ).toBeTruthy();
      await helper.viewKitDemo.click();
      await page.waitForLoadState( 'networkidle' );
      await page.waitForTimeout( 500 );
      await expect( helper.kitH1 ).toContainText( testData.top5MostPopularKits[ 'Local Services Wireframe 2' ].pages.Home );
      await helper.selectBackToLibraryButton();
      await expect( helper.appTitle ).toContainText( testData.libraryAppTitle );
   } );

   test( 'User can filter by free plan', async ( { page } ) => {
      await helper.goToKitPage();
      await page.waitForLoadState( 'networkidle' );

      // At Initial Load all three categories should be expanded
      await helper.categoriesTitle.click();
      await helper.kitsByPlanTitle.click();
      await helper.checkFreePlan();
      await page.waitForTimeout( 500 );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.freePlanKits );
      await globalHelper.checkTextIsNotPresentInArray( page, helper.kitTitles, testData.proPlanKits );
   } );

   test( 'User can filter by pro plan', async ( { page } ) => {
      await helper.goToKitPage();
      await page.waitForLoadState( 'networkidle' );

      // At Initial Load all three categories should be expanded
      await helper.categoriesTitle.click();
      await helper.kitsByPlanTitle.click();
      await helper.checkProPlan();
      await page.waitForTimeout( 500 );
      await globalHelper.checkTextIsPresentInArray( page, helper.kitTitles, testData.proPlanKits );
      await globalHelper.checkTextIsNotPresentInArray( page, helper.kitTitles, testData.freePlanKits );
   } );

   test( 'User can do an overview of a kit and view one of the pages', async ( { page } ) => {
      await helper.goToKitPage();
      await page.waitForLoadState( 'networkidle' );
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
      await helper.goToKitPage();
      await helper.selectSortoption( testData.dropDownSortValues[ 2 ] );
      await page.waitForTimeout( 500 );
      await helper.validateTop5PopularKits( Object.keys( testData.top5MostPopularKits ) );
   } );
} );
