<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Active_Menu_Resolver;
use Elementor\Modules\EditorOne\Classes\Url_Matcher;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Active_Menu_Resolver extends PHPUnit_TestCase {

	private Active_Menu_Resolver $resolver;
	private Url_Matcher $url_matcher;

	public function setUp(): void {
		parent::setUp();
		$this->url_matcher = new Url_Matcher();
		$this->resolver = new Active_Menu_Resolver( $this->url_matcher );
	}

	/**
	 * @dataProvider data_create_active_state
	 */
	public function test_create_active_state( $menu_slug, $child_slug, $score, $expected ) {
		$result = $this->resolver->create_active_state( $menu_slug, $child_slug, $score );
		$this->assertEquals( $expected, $result );
	}

	public function data_create_active_state() {
		return [
			'defaults' => [
				'elementor-settings',
				'',
				0,
				[ 'menu_slug' => 'elementor-settings', 'child_slug' => '', 'score' => 0 ],
			],
			'with_child' => [
				'elementor-settings',
				'general',
				0,
				[ 'menu_slug' => 'elementor-settings', 'child_slug' => 'general', 'score' => 0 ],
			],
			'with_score' => [
				'elementor-settings',
				'general',
				5,
				[ 'menu_slug' => 'elementor-settings', 'child_slug' => 'general', 'score' => 5 ],
			],
		];
	}

	public function test_resolve__returns_home_slug_for_editor_page() {
		$menu_items = [];
		$level4_groups = [];
		$current_page = 'elementor-editor';
		$current_uri = '/wp-admin/admin.php?page=elementor-editor';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__returns_best_matching_menu_item() {
		$menu_items = [
			[
				'slug' => 'elementor-settings',
				'url' => '/wp-admin/admin.php?page=elementor-settings',
				'group_id' => '',
			],
			[
				'slug' => 'elementor-tools',
				'url' => '/wp-admin/admin.php?page=elementor-tools',
				'group_id' => '',
			],
		];
		$level4_groups = [];
		$current_page = 'elementor-settings';
		$current_uri = '/wp-admin/admin.php?page=elementor-settings';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-settings', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__returns_level4_child_when_matching() {
		$menu_items = [
			[
				'slug' => 'elementor-custom-elements',
				'url' => '/wp-admin/admin.php?page=elementor-custom-elements',
				'group_id' => 'custom-elements-group',
			],
		];
		$level4_groups = [
			'custom-elements-group' => [
				'items' => [
					[
						'slug' => 'custom-fonts',
						'url' => '/wp-admin/edit.php?post_type=elementor_font',
					],
					[
						'slug' => 'custom-icons',
						'url' => '/wp-admin/edit.php?post_type=elementor_icons',
					],
				],
			],
		];
		$current_page = '';
		$current_uri = '/wp-admin/edit.php?post_type=elementor_font';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( 'custom-fonts', $result['child_slug'] );
	}

	public function test_resolve__selects_higher_score_match() {
		$menu_items = [
			[
				'slug' => 'elementor-settings',
				'url' => '/wp-admin/admin.php?page=elementor',
				'group_id' => '',
			],
			[
				'slug' => 'elementor-settings-advanced',
				'url' => '/wp-admin/admin.php?page=elementor&tab=advanced',
				'group_id' => '',
			],
		];
		$level4_groups = [];
		$current_page = '';
		$current_uri = '/wp-admin/admin.php?page=elementor&tab=advanced';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-settings-advanced', $result['menu_slug'] );
	}

	public function test_resolve__returns_empty_when_no_match() {
		$menu_items = [
			[
				'slug' => 'elementor-settings',
				'url' => '/wp-admin/admin.php?page=elementor-settings',
				'group_id' => '',
			],
		];
		$level4_groups = [];
		$current_page = '';
		$current_uri = '/wp-admin/admin.php?page=unrelated-plugin';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( '', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__handles_empty_menu_items() {
		$menu_items = [];
		$level4_groups = [];
		$current_page = '';
		$current_uri = '/wp-admin/admin.php?page=elementor';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( '', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__handles_empty_level4_group_items() {
		$menu_items = [
			[
				'slug' => 'elementor-custom-elements',
				'url' => '/wp-admin/admin.php?page=elementor-custom-elements',
				'group_id' => 'custom-elements-group',
			],
		];
		$level4_groups = [
			'custom-elements-group' => [
				'items' => [],
			],
		];
		$current_page = '';
		$current_uri = '/wp-admin/admin.php?page=elementor-custom-elements';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__skips_missing_level4_group() {
		$menu_items = [
			[
				'slug' => 'elementor-custom-elements',
				'url' => '/wp-admin/admin.php?page=elementor-custom-elements',
				'group_id' => 'non-existent-group',
			],
		];
		$level4_groups = [];
		$current_page = '';
		$current_uri = '/wp-admin/admin.php?page=elementor-custom-elements';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__prioritizes_level4_over_level3_with_same_score() {
		$menu_items = [
			[
				'slug' => 'elementor-custom-elements',
				'url' => '/wp-admin/edit.php?post_type=elementor_font',
				'group_id' => 'custom-elements-group',
			],
		];
		$level4_groups = [
			'custom-elements-group' => [
				'items' => [
					[
						'slug' => 'custom-fonts',
						'url' => '/wp-admin/edit.php?post_type=elementor_font',
					],
				],
			],
		];
		$current_page = '';
		$current_uri = '/wp-admin/edit.php?post_type=elementor_font';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( 'custom-fonts', $result['child_slug'] );
	}

	public function test_resolve__matches_popup_templates_page() {
		$menu_items = [
			[
				'slug' => 'elementor-templates',
				'url' => '/wp-admin/admin.php?page=elementor-templates',
				'group_id' => 'templates-group',
			],
		];
		$level4_groups = [
			'templates-group' => [
				'items' => [
					[
						'slug' => 'popup_templates',
						'url' => '/wp-admin/admin.php?page=popup_templates',
					],
				],
			],
		];
		$current_page = 'popup_templates';
		$current_uri = '/wp-admin/admin.php?page=popup_templates';

		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		$this->assertEquals( 'elementor-templates', $result['menu_slug'] );
		$this->assertEquals( 'popup_templates', $result['child_slug'] );
	}
}
