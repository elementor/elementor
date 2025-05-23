<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Api;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Canary_Deployment extends Elementor_Test_Base {

	const CURRENT_VERSION = ELEMENTOR_VERSION;
	const PLUGIN_BASE = ELEMENTOR_PLUGIN_BASE;
	const PLUGIN_FILE = ELEMENTOR__FILE__;
	const CANARY_DEPLOYMENT_CLASS = 'Elementor\Core\Admin\Canary_Deployment';

	public function setUp() {
		parent::setUp();

		// Create an instance if not exist. (on test only this class).
		Plugin::instance();
	}

	/**
	 * On first plugins updates check, the initial transient is empty. canary SHOULD NOT filter the data.
	 */
	public function test_wp_no_response() {
		$canary_version = $this->increase_version( static::CURRENT_VERSION );
		$this->set_api_info( $canary_version );

		// Empty data.
		$wp_plugins_transient = (object)[
			'last_checked' => time(),
		];

		$filtered_transient = $this->canary_check( $wp_plugins_transient );

		$this->assertSame( $wp_plugins_transient, $filtered_transient );
	}

	/**
	 * If the stable doesn't has updates. canary SHOULD add his new version.
	 */
	public function test_no_stable_update() {
		$canary_version = $this->increase_version( static::CURRENT_VERSION );
		$this->set_api_info( $canary_version );

		$filtered_transient = $this->canary_check();

		$this->assertSame( $canary_version, $filtered_transient->response[ static::PLUGIN_BASE ]->new_version );
	}

	/**
	 * If both canary and stable version has updates, but canary is newer. canary SHOULD add his new version.
	 */
	public function test_canary_is_newer() {
		$stable_newer_version = $this->increase_version( static::CURRENT_VERSION );

		$canary_version = $this->increase_version( $stable_newer_version );
		$this->set_api_info( $canary_version );

		// Empty data.
		$wp_plugins_transient = (object)[
			'last_checked' => time(),
			'response' => [
				static::PLUGIN_BASE => (object) [
					'new_version' => $stable_newer_version,
				]
			]
		];

		$filtered_transient = $this->canary_check( $wp_plugins_transient );

		$this->assertSame( $canary_version, $filtered_transient->response[ static::PLUGIN_BASE ]->new_version );
	}

	/**
	 * If the stable version has newer updates. canary SHOULD NOT add his new version.
	 */
	public function test_stable_is_newer() {
		$canary_version = $this->increase_version( static::CURRENT_VERSION );
		$this->set_api_info( $canary_version );

		$stable_newer_version =  $this->increase_version( $canary_version );

		// Empty data.
		$wp_plugins_transient = (object)[
			'last_checked' => time(),
			'response' => [
				static::PLUGIN_BASE => (object) [
					'new_version' => $stable_newer_version,
				]
			]
		];

		$filtered_transient = $this->canary_check( $wp_plugins_transient );

		$this->assertSame( $stable_newer_version, $filtered_transient->response[ static::PLUGIN_BASE ]->new_version );
	}

	public function test_condition_type_wordpress() {
		$condition = [
			'type' => 'wordpress',
			'operator' => '>',
		];

		// Bigger than.
		$condition['version'] = $this->increase_version( $GLOBALS['wp_version'] );
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );

		// Equal.
		$condition['version'] = $GLOBALS['wp_version'];
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );

		// Lower than.
		$condition['version'] = $this->decrease_version( $GLOBALS['wp_version'] );
		$filtered_transient = $this->check_condition( $condition );
		$this->assertNotEmpty( $filtered_transient->response );
	}

	public function test_condition_type_multisite() {
		$condition = [
			'type' => 'multisite',
		];

		// Same as current.
		$condition['multisite'] = is_multisite();
		$filtered_transient = $this->check_condition( $condition );
		$this->assertNotEmpty( $filtered_transient->response );

		// Vice versa.
		$condition['multisite'] = ! is_multisite();
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );
	}

	public function test_condition_type_language() {
		$condition = [
			'type' => 'language',
			'languages' => [ 'en_US' ],
		];

		// Same as current.
		$condition['operator'] = 'in';
		$filtered_transient = $this->check_condition( $condition );
		$this->assertNotEmpty( $filtered_transient->response );

		// Vice versa.
		$condition['operator'] = 'not_in';
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );
	}

	public function test_condition_type_plugin() {
		$this->markTestSkipped();

		// Not active.
		$filtered_transient = $this->check_condition( [
			'type' => 'plugin',
			'plugin' => 'not-exist-plugin.php',
			'version' => '',
			'operator' => '=',
		] );
		$this->assertNotEmpty( $filtered_transient->response );

		// On tests, the plugin base (for `is_plugin_active`) is 'elementor/elementor.php', but the real file (for `get_plugin_data`) is static::PLUGIN_BASE.
		$condition = [
			'type' => 'plugin',
			'plugin' => PLUGIN_PATH, // @see tests/bootstrap.php:14.
			'plugin_file' => static::PLUGIN_FILE,
			'operator' => '>',
		];

		// Active.
		$condition['version'] = '0';
		$filtered_transient = $this->check_condition( $condition );
		$this->assertNotEmpty( $filtered_transient->response );

		// Bigger than.
		$condition['version'] = $this->increase_version( static::CURRENT_VERSION );
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );

		// Equal.
		$condition['version'] = static::CURRENT_VERSION;
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );

		// Lower than.
		$condition['version'] = $this->decrease_version( static::CURRENT_VERSION );
		$filtered_transient = $this->check_condition( $condition );

		$this->assertNotEmpty( $filtered_transient->response );
	}

	public function test_condition_type_theme() {
		// Not active.
		$filtered_transient = $this->check_condition( [
			'type' => 'theme',
			'theme' => 'not-active-theme',
			'version' => '',
			'operator' => '=',
		] );
		$this->assertNotEmpty( $filtered_transient->response );

		$theme = wp_get_theme();

		$condition = [
			'type' => 'theme',
			'theme' => $theme->get_template(),
			'operator' => '>',
		];

		// Active.
		$condition['version'] = '0';
		$filtered_transient = $this->check_condition( $condition );
		$this->assertNotEmpty( $filtered_transient->response );

		// Bigger than.
		$condition['version'] = $this->increase_version( $theme->version );
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );

		// Equal.
		$condition['version'] = $theme->version;
		$filtered_transient = $this->check_condition( $condition );
		$this->assertEmpty( $filtered_transient->response );

		// Lower than.
		$condition['version'] = $this->decrease_version( $theme->version );
		$filtered_transient = $this->check_condition( $condition );

		$this->assertNotEmpty( $filtered_transient->response );
	}

	public function test_condition_group() {
		$group = [
			// Valid.
			[
				'type' => 'wordpress',
				'version' => $GLOBALS['wp_version'],
				'operator' => '=',
			],
			// Not valid.
			[
				'type' => 'wordpress',
				'version' => $GLOBALS['wp_version'],
				'operator' => '>',
			]
		];

		// Relation `AND`. All conditions should pass.
		$filtered_transient = $this->check_conditions_group( $group );

		$this->assertEmpty( $filtered_transient->response );

		// Relation `OR`. One condition should pass.
		$group['relation'] = 'OR';
		$filtered_transient = $this->check_conditions_group( $group );

		$this->assertNotEmpty( $filtered_transient->response );
	}

	private function check_condition( $condition ) {
		return $this->check_conditions_group( [
			$condition,
		] );
	}

	private function check_conditions_group( $group ) {
		$canary_version = $this->increase_version( static::CURRENT_VERSION );

		$this->set_api_info( $canary_version, [
			$group
		] );

		$wp_plugins_transient = (object)[
			'last_checked' => time(),
			'response' => []
		];

		return $this->canary_check( $wp_plugins_transient );
	}

	private function set_api_info( $canary_version, $conditions = [] ) {
		$elementor_api_data_transient_key = Api::TRANSIENT_KEY_PREFIX . static::CURRENT_VERSION;

		set_transient( $elementor_api_data_transient_key, [
			'canary_deployment' => [
				'plugin_info' => [
					'new_version' => $canary_version,
				],
				'conditions' => $conditions,
			],
		] );
	}

	private function increase_version( $version ) {
		return $version . '1';
	}

	private function decrease_version( $version ) {
		$version_parts = explode( '.', $version );
		array_pop( $version_parts );
		return implode( '.', $version_parts );
	}

	private function canary_check( $transient = null ) {
		if ( null === $transient ) {
			$transient = (object)[
				'last_checked' => time(),
				'response' => []
			];
		}

		$class_name = static::CANARY_DEPLOYMENT_CLASS;
		$cd = new $class_name();

		return $cd->check_version( $transient );
	}
}
