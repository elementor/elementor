<?php

namespace elementor\tests\phpunit\elementor\modules\home;

use Elementor\Modules\Home\API;
use Elementor\Includes\EditorAssetsAPI;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Hosting extends PHPUnit_TestCase {
	public function test_homescreen_filter_called_once() {
		$mock_editor_assets_api = $this->getMockBuilder( EditorAssetsAPI::class )
			->disableOriginalConstructor()
			->getMock();

		$api = new API( $mock_editor_assets_api );

		$mock_editor_assets_api->method( 'get_assets_data' )
			->willReturn( $this->mock_home_screen_data() );

		$mock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'callback' ] )
			->getMock();

		add_filter( 'elementor/core/admin/homescreen', [ $mock, 'callback' ] );

		$mock->expects( $this->once() )
			->method( 'callback' )
			->with( $this->mock_home_screen_data() )
			->willReturn( $this->mock_home_screen_data() );

		$api->get_home_screen_items();
	}

	private function mock_home_screen_data() {
		return [
			"top_with_licences" => [
				[
					"license" => [ "free" ],
					"title_small" => "Hi!",
					"title" => "Unleash your imagination with Elementor",
					"description" => "Start building your website with Elementor's no code drag & drop editor.",
					"button_create_page_title" => "Create a Page",
					"button_watch_title" => "Watch a guide",
					"button_watch_url" => "https://www.youtube.com/watch?v=le72grP_Q6k&t=1s",
					"youtube_embed_id" => "le72grP_Q6k?si=g2akyWNODL6usu6u",
				],
				[
					"license" => [ "pro" ],
					"title_small" => "Hi!",
					"title" => "Unleash your imagination with Elementor",
					"description" => "Now you've got all the tools to start creating professional, high-performing websites - and that journey begins by creating your first page.",
					"button_create_page_title" => "Create a Page",
					"button_watch_title" => "Watch a guide",
					"button_watch_url" => "https://www.youtube.com/watch?v=QdkDGrS8ZZs",
					"youtube_embed_id" => "QdkDGrS8ZZs?si=s_VjZCQR6Fh1jgB5",
				],
			],
			"create_with_ai" => [
				"title" => "Create and launch your site faster with AI",
				"description" => "Share your vision with our AI Chat and watch as it becomes a brief, sitemap, and wireframes in minutes:",
				"input_placeholder" => "Start describing the site you want to create...",
				"button_title" => "Create with AI",
				"button_cta_url" => "http://planner.elementor.com/chat.html",
				"background_image" => ELEMENTOR_ASSETS_URL . 'images/app/ai/ai-site-creator-homepage-bg.svg',
			],
			"get_started" => [
				[
					"license" => [ "free" ],
					"header" => [
						"title" => "Jumpstart your web-creation",
						"description" => "These quick actions will get your site airborne with a customized design.",
					],
					"repeater" => [
						[
							"title" => "Site Settings",
							"title_small" => "Customize",
							"url" => "",
							"is_relative_url" => false,
							"title_small_color" => "text.tertiary",
							"image" => "https://assets.elementor.com/home-screen/v1/images/site-settings.svg",
						],
						[
							"title" => "Site Logo",
							"title_small" => "Customize",
							"url" => "",
							"is_relative_url" => false,
							"title_small_color" => "text.tertiary",
							"tab_id" => "settings-site-identity",
							"image" => "https://assets.elementor.com/home-screen/v1/images/site-logo.svg",
						],
						[
							"title" => "Global Colors",
							"title_small" => "Customize",
							"url" => "",
							"is_relative_url" => false,
							"title_small_color" => "text.tertiary",
							"tab_id" => "global-colors",
							"image" => "https://assets.elementor.com/home-screen/v1/images/global-colors.svg",
						],
						[
							"title" => "Global Fonts",
							"title_small" => "Customize",
							"url" => "",
							"is_relative_url" => false,
							"title_small_color" => "text.tertiary",
							"tab_id" => "global-typography",
							"image" => "https://assets.elementor.com/home-screen/v1/images/global-fonts.svg",
						],
						[
							"title" => "Theme Builder",
							"title_small" => "Customize",
							"url" => "admin.php?page=elementor-app",
							"is_relative_url" => false,
							"title_small_color" => "text.tertiary",
							"image" => "https://assets.elementor.com/home-screen/v1/images/theme-builder.svg",
						],
						[
							"title" => "Popups",
							"title_small" => "Customize",
							"url" => "edit.php?post_type=elementor_library&page=popup_templates",
							"is_relative_url" => true,
							"title_small_color" => "text.tertiary",
							"image" => "https://assets.elementor.com/home-screen/v1/images/popups.svg",
						],
						[
							"title" => "Custom Icons",
							"title_small" => "Customize",
							"url" => "admin.php?page=elementor_custom_icons",
							"is_relative_url" => false,
							"title_small_color" => "text.tertiary",
							"image" => "https://assets.elementor.com/home-screen/v1/images/custom-icons.svg",
						],
						[
							"title" => "Custom Fonts",
							"title_small" => "Customize",
							"url" => "admin.php?page=elementor_custom_fonts",
							"is_relative_url" => true,
							"image" => "https://assets.elementor.com/home-screen/v1/images/custom-fonts.svg",
							"title_small_color" => "text.tertiary",
						],
					],
				],
				[
					"license" => [ "pro" ],
					"header" => [
						"title" => "Jumpstart your web-creation",
						"description" => "These quick actions will get your site airborne with a customized design.",
					],
					"repeater" => [],
				],
			],
			"add_ons" => [
				"header" => [
					"title" => "Expand your design toolkit",
					"description" => "These plugins, add-ons, and tools, have been selected to streamline your workflow and maximize your creativity.",
				],
				"repeater" => [],
				"footer" => [
					"label" => "Explore more add-ons",
					"file_path" => "wp-admin/admin.php?page=elementor-apps",
				],
			],
			"sidebar_upgrade" => [
				[
					"license" => [ "free" ],
					"show" => true,
					"header" => [
						"title" => "Bring your vision to life",
						"description" => "Get complete design flexibility for your website with Elementor Pro’s advanced tools and premium features.",
						"image" => "https://assets.elementor.com/home-screen/v1/images/update-sidebar.svg",
					],
					"cta" => [
						"label" => "Upgrade Now",
						"url" => "https://go.elementor.com/go-pro-home-sidebar-upgrade/",
						"image" => "https://assets.elementor.com/home-screen/v1/images/icon-crown.svg",
					],
					"repeater" => [
						[ "title" => "Popup Builder" ],
						[ "title" => "Custom Code & CSS" ],
					],
				],
			],
			"external_links" => [
				[
					"label" => "Help Center",
					"image" => "https://assets.elementor.com/home-screen/v1/images/icon-question-mark.svg",
					"url" => "https://elementor.com/help/",
				],
				[
					"label" => "Youtube",
					"image" => "https://assets.elementor.com/home-screen/v1/images/icon-youtube.svg",
					"url" => "https://www.youtube.com/@Elementor",
				],
			],
		];
	}
}
