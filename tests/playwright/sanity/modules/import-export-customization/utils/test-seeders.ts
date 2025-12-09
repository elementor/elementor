import { type Page, type TestInfo, type APIRequestContext } from '@playwright/test';
import * as path from 'path';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';
import { Post } from '../../../../types/types';

export interface CreatedItems {
	pages: Array<{ id: string; title: string; content: string }>;
	posts: Array<{ id: string; title: string; content: string }>;
	categories: Array<{ id: string; name: string; slug: string }>;
	tags: Array<{ id: string; name: string; slug: string }>;
	menus: Array<{ id: string; name: string }>;
	elementorPages: Array<{ id: string }>;
}

export async function setupCompleteTestData( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ): Promise<CreatedItems> {
	const request = page.context().request;
	const createdItems: CreatedItems = {
		pages: [],
		posts: [],
		categories: [],
		tags: [],
		menus: [],
		elementorPages: [],
	};

	createdItems.pages = await createSampleContent( apiRequests, request, 'pages', [
		{ title: 'Home Page', content: 'Welcome to our website' },
		{ title: 'About Page', content: 'Learn more about us' },
		{ title: 'Contact Page', content: 'Get in touch with us' },
	] );

	createdItems.posts = await createSampleContent( apiRequests, request, 'posts', [
		{ title: 'Blog Post 1', content: 'First blog post content' },
		{ title: 'Blog Post 2', content: 'Second blog post content' },
	] );

	const elementorPageId = await createElementorContent( page, testInfo, apiRequests );
	createdItems.elementorPages.push( { id: elementorPageId } );

	const taxonomies = await createTaxonomies( apiRequests, request );
	createdItems.categories.push( ...taxonomies.categories );
	createdItems.tags.push( ...taxonomies.tags );

	const navMenu = await createNavigationMenu( apiRequests, request );
	createdItems.menus.push( navMenu );

	return createdItems;
}

export async function createSampleContent( apiRequests: ApiRequests, request: APIRequestContext, postType: string, items: Array<{ title: string; content: string }> ) {
	const results = [];

	for ( const item of items ) {
		const postId = await apiRequests.create( request, postType, {
			title: item.title,
			content: item.content,
			status: 'publish',
		} as Post );

		results.push( { id: postId, ...item } );
	}

	return results;
}

export async function createElementorContent( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	const editorPage = await wpAdminPage.openNewPage();

	await editorPage.loadJsonPageTemplate(
		path.join( __dirname, '..' ),
		'elementor-custom-page',
		'.e-con-inner',
	);

	await editorPage.publishPage();

	return editorPage.getPageId();
}

export async function createTaxonomies( apiRequests: ApiRequests, request: APIRequestContext ) {
	const uniqueSuffix = process.env.TEST_PARALLEL_INDEX || Date.now();
	const categoryName = `Test Category ${ uniqueSuffix }`;
	const categorySlug = `test-category-${ uniqueSuffix }`;
	const tagName = `Test Tag ${ uniqueSuffix }`;
	const tagSlug = `test-tag-${ uniqueSuffix }`;

	const categoryId = await apiRequests.create( request, 'categories', {
		name: categoryName,
		slug: categorySlug,
	} as Post );

	const tagId = await apiRequests.create( request, 'tags', {
		name: tagName,
		slug: tagSlug,
	} as Post );

	return {
		categories: [ { id: categoryId, name: categoryName, slug: categorySlug } ],
		tags: [ { id: tagId, name: tagName, slug: tagSlug } ],
	};
}

export async function createNavigationMenu( apiRequests: ApiRequests, request: APIRequestContext ) {
	const menuId = await apiRequests.create( request, 'menus', { name: 'Test Menu' } as Post );

	return { id: menuId, name: 'Test Menu' };
}

export async function cleanupCreatedItems( apiRequests: ApiRequests, request: APIRequestContext, createdItems: CreatedItems ) {
	if ( ! createdItems ) {
		return;
	}

	for ( const menu of createdItems.menus || [] ) {
		await apiRequests.delete( request, 'menus', menu.id );
	}

	for ( const category of createdItems.categories || [] ) {
		await apiRequests.delete( request, 'categories', category.id );
	}

	for ( const tag of createdItems.tags || [] ) {
		await apiRequests.delete( request, 'tags', tag.id );
	}

	for ( const page of createdItems.pages || [] ) {
		await apiRequests.delete( request, 'pages', page.id );
	}

	for ( const post of createdItems.posts || [] ) {
		await apiRequests.delete( request, 'posts', post.id );
	}

	for ( const elementorPage of createdItems.elementorPages || [] ) {
		await apiRequests.delete( request, 'pages', elementorPage.id );
	}
}
