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

	public function test_create_active_state__creates_state_with_defaults() {
		// Arrange
		$menu_slug = 'elementor-settings';

		// Act
		$result = $this->resolver->create_active_state( $menu_slug );

		// Assert
		$expected = [
			'menu_slug' => 'elementor-settings',
			'child_slug' => '',
			'score' => 0,
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_create_active_state__creates_state_with_child_slug() {
		// Arrange
		$menu_slug = 'elementor-settings';
		$child_slug = 'general';

		// Act
		$result = $this->resolver->create_active_state( $menu_slug, $child_slug );

		// Assert
		$expected = [
			'menu_slug' => 'elementor-settings',
			'child_slug' => 'general',
			'score' => 0,
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_create_active_state__creates_state_with_score() {
		// Arrange
		$menu_slug = 'elementor-settings';
		$child_slug = 'general';
		$score = 5;

		// Act
		$result = $this->resolver->create_active_state( $menu_slug, $child_slug, $score );

		// Assert
		$expected = [
			'menu_slug' => 'elementor-settings',
			'child_slug' => 'general',
			'score' => 5,
		];
		$this->assertEquals( $expected, $result );
	}

	public function test_resolve__returns_home_slug_for_editor_page() {
		// Arrange
		$menu_items = [];
		$level4_groups = [];
		$current_page = 'elementor-editor';
		$current_uri = '/wp-admin/admin.php?page=elementor-editor';

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-home', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__returns_best_matching_menu_item() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-settings', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__returns_level4_child_when_matching() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( 'custom-fonts', $result['child_slug'] );
	}

	public function test_resolve__selects_higher_score_match() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-settings-advanced', $result['menu_slug'] );
	}

	public function test_resolve__returns_empty_when_no_match() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( '', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__handles_empty_menu_items() {
		// Arrange
		$menu_items = [];
		$level4_groups = [];
		$current_page = '';
		$current_uri = '/wp-admin/admin.php?page=elementor';

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( '', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__handles_empty_level4_group_items() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__skips_missing_level4_group() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( '', $result['child_slug'] );
	}

	public function test_resolve__prioritizes_level4_over_level3_with_same_score() {
		// Arrange
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

		// Act
		$result = $this->resolver->resolve( $menu_items, $level4_groups, $current_page, $current_uri );

		// Assert
		$this->assertEquals( 'elementor-custom-elements', $result['menu_slug'] );
		$this->assertEquals( 'custom-fonts', $result['child_slug'] );
	}
}

