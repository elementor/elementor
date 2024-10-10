import WpAdminPage from '../../../pages/wp-admin-page';
import type { APIRequestContext } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

export default class FloatingElementPage extends WpAdminPage {
	async goToFloatingButtonsEmptyPage() {
		await this.page.goto(
			'/wp-admin/edit.php?post_type=elementor_library&page=e-floating-buttons',
		);
	}

	async goToFloatingButtonsPage() {
		await this.page.goto(
			'/wp-admin/edit.php?post_type=e-floating-buttons',
		);
	}

	async deleteAllFloatingButtons() {
		await this.goToFloatingButtonsPage();
		await this.page.locator( '#cb-select-all-1' ).click();
		await this.page.locator( '#bulk-action-selector-top' ).selectOption( 'trash' );
		await this.page.locator( '#doaction' ).click();
		await this.page.waitForURL( '/wp-admin/edit.php?post_type=e-floating-buttons&paged=1' );
	}

	async createFloatingButtonWithAPI() {
		const request: APIRequestContext = this.page.context().request,
			postDataInitial = {
				title: 'Playwright Test Floating Element - Uninitialized',
				status: 'publish',
				content: '<button aria-controls="e-contact-buttons__content-wrapper" aria-label="Close Floating Element" type="button">\n' +
					'\t\t\t</button>\n' +
					'\t\t\t\t<img width="300" height="200" src="http://elementor.local/wp-content/uploads/2024/07/law-showcase-2-cover-300x200.jpg" alt="" decoding="async" srcset="http://elementor.local/wp-content/uploads/2024/07/law-showcase-2-cover-300x200.jpg 300w, http://elementor.local/wp-content/uploads/2024/07/law-showcase-2-cover-1024x683.jpg 1024w, http://elementor.local/wp-content/uploads/2024/07/law-showcase-2-cover-768x512.jpg 768w, http://elementor.local/wp-content/uploads/2024/07/law-showcase-2-cover.jpg 1530w" sizes="(max-width: 300px) 100vw, 300px" />\t\t\t\n' +
					'\t\t\t\t\t\t\t\t\t<p>Dorian Hayes</p>\n' +
					'\t\t\t\t\t\t\t\t\t\t\t\t\t<p>Store Manager</p>\n' +
					'\t\t\t\t\t\t\t\t\t\t\t<p>Dorian</p>\n' +
					'\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<p>Hey, how can I help you today?</p>\n' +
					'\t\t\t\t\t\t\t\t\t\t<p data-time-format="12h"></p>\n' +
					'\t\t\t\t<p>\n' +
					'\t\t\t\t\tPowered by Elementor\t\t\t\t</p>\n' +
					'\t\t\t\t\t\t\t\t\t<a href="" rel="noopener noreferrer" target="_blank">\n' +
					'\t\t\t\t\t\t<svg aria-hidden="true" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>\t\t\t\t\t\tClick to start chat\t\t\t\t\t</a>\n' +
					'\t\t\t<button aria-controls="e-contact-buttons__content-wrapper" aria-label="Toggle Floating Element" type="button">\n' +
					'\t\t\t\t<svg aria-hidden="true" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>\t\t\t</button>',
				meta: {
					_elementor_floating_elements_type: 'floating-buttons',
					_elementor_edit_mode: 'builder',
					_elementor_template_type: 'floating-buttons',
					_wp_page_template: 'elementor_canvas',
					_elementor_version: '3.24',
					_elementor_data: '[{"id":"2238e76a","elType":"container","settings":[],"elements":[{"id":"7e8dd931","elType":"widget","settings":{"content_width":"full","top_bar_title":"Dorian Hayes","top_bar_subtitle":"Store Manager","top_bar_image":{"id":"105","url":"http:\\/\\/elementor.local\\/wp-content\\/uploads\\/2024\\/07\\/law-showcase-2-cover.jpg"},"message_bubble_name":"Dorian","message_bubble_body":"Hey, how can I help you today?","send_button_text":"Click to start chat","_background_image":{"url":"","id":"","size":""},"_background_video_fallback":{"url":"","id":"","size":""},"_background_slideshow_gallery":[],"_background_hover_image":{"url":"","id":"","size":""},"_background_hover_video_fallback":{"url":"","id":"","size":""},"_background_hover_slideshow_gallery":[],"_mask_image":{"url":"","id":"","size":""},"chat_aria_label":"Floating Element"},"elements":[],"widgetType":"contact-buttons"}],"isInner":false}]',
					_elementor_controls_usage: 'a:2:{s:15:"contact-buttons";a:3:{s:5:"count";i:1;s:15:"control_percent";i:1;s:8:"controls";a:1:{s:7:"content";a:2:{s:15:"top_bar_section";a:2:{s:13:"top_bar_title";i:1;s:13:"top_bar_image";i:1;}s:22:"message_bubble_section";a:1:{s:19:"message_bubble_name";i:1;}}}}s:9:"container";a:3:{s:5:"count";i:1;s:15:"control_percent";i:0;s:8:"controls";a:0:{}}}',
				},
			},
			postId = await this.apiRequests.createWithREST( request, 'e-floating-buttons', postDataInitial ),
			postDataUpdated = {
				title: `Playwright Test Page #${ postId }`,
			};

		await this.apiRequests.create( request, `e-floating-buttons/${ postId }`, postDataUpdated );
		await this.page.goto( `/wp-admin/post.php?post=${ postId }&action=elementor` );

		return new EditorPage( this.page, this.testInfo, postId );
	}
}
