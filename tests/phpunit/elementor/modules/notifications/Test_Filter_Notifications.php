<?php

namespace elementor\tests\phpunit\elementor\modules\notifications;

use Elementor\Modules\Notifications\API;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Notifications extends PHPUnit_TestCase {
	public function test_notifications_filter_called_once() {
		// Arrange
//		$mock_editor_assets_api = $this->getMockBuilder( API::class )
//			->disableOriginalConstructor()
//			->getMock();
//
//		$mock_editor_assets_api->method( 'get_transient' )
//			->willReturn( $this->mock_notifications_data() );
//
//		$api = new API( $mock_editor_assets_api );

		$mock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'callback' ] )
			->getMock();

		$mock->expects( $this->once() )
			->method( 'callback' )
			->with( $this->mock_notifications_data() )
			->willReturn( $this->mock_notifications_data() );

		// Act
		add_filter( 'elementor/core/admin/notifications', [ $mock, 'callback' ] );

		// Mock transient to return false (forcing fetch_data execution)
		\WP_Mock::userFunction('get_transient', [
			'args'   => ['_elementor_notifications_data'],
			'return' => false,
		]);

		// Mock static method fetch_data to return mock notification data
		\WP_Mock::userFunction('fetch_data', [
			'return' => $this->mock_notifications_data(),
		]);

		// Mock static method set_transient (since it’s called after fetch_data)
		\WP_Mock::userFunction('set_transient', [
			'args'   => ['_elementor_notifications_data', $this->mock_notifications_data(), '+1 hour'],
		]);

		// Assert filter to be triggered once
		$reflection = new \ReflectionMethod( API::class, 'get_notifications' );
		$reflection->setAccessible( true );

		// Act: Call the private static method
		$result = $reflection->invokeArgs( null, [ false ] );

		// Assert: Ensure we received the filtered notifications
//		$this->assertEquals( $this->mock_notifications_data(), $result );
	}

	private function mock_notifications_data() {
		return [
					"top_with_licences" => [
						[
							"license" => ["free"],
							"title_small" => "Hi!",
							"title" => "Unleash your imagination with Elementor",
							"description" => "Start building your website with Elementor's no code drag & drop editor.",
							"button_create_page_title" => "Create a Page",
							"button_watch_title" => "Watch a guide",
							"button_watch_url" => "https://www.youtube.com/watch?v=le72grP_Q6k&t=1s",
							"youtube_embed_id" => "le72grP_Q6k?si=g2akyWNODL6usu6u",
						],
						[
							"license" => ["pro"],
							"title_small" => "Hi!",
							"title" => "Unleash your imagination with Elementor",
							"description" => "Now you've got all the tools to start creating professional, high-performing websites - and that journey begins by creating your first page.",
							"button_create_page_title" => "Create a Page",
							"button_watch_title" => "Watch a guide",
							"button_watch_url" => "https://www.youtube.com/watch?v=QdkDGrS8ZZs",
							"youtube_embed_id" => "QdkDGrS8ZZs?si=s_VjZCQR6Fh1jgB5",
						],
					],
					"get_started" => [
						[
							"license" => ["free"],
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
							"license" => ["pro"],
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
							"license" => ["free"],
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
								["title" => "Popup Builder"],
								["title" => "Custom Code & CSS"],
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
