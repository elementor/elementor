<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Disable_Super_Admin_Ability;
use Elementor\Modules\Mcp\Abilities\Enable_Super_Admin_Ability;
use Elementor\Modules\Mcp\Abilities\Execute_Php_Ability;
use Elementor\Modules\Mcp\Abilities\Get_Super_Admin_Status_Ability;
use Elementor\Modules\Mcp\Abilities\List_Directory_Ability;
use Elementor\Modules\Mcp\Abilities\Read_File_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Super_Admin_Ability_Registration extends Elementor_Test_Base {

	private const ENABLE_ID = 'elementor/enable-super-admin';
	private const DISABLE_ID = 'elementor/disable-super-admin';
	private const STATUS_ID = 'elementor/get-super-admin-status';
	private const EXECUTE_PHP_ID = 'elementor/execute-php';
	private const READ_FILE_ID = 'elementor/read-file';
	private const LIST_DIRECTORY_ID = 'elementor/list-directory';

	/**
	 * @return array<string, array{0: string, 1: object}>
	 */
	public function super_admin_ability_provider(): array {
		return [
			'enable' => [ self::ENABLE_ID, new Enable_Super_Admin_Ability() ],
			'disable' => [ self::DISABLE_ID, new Disable_Super_Admin_Ability() ],
			'status' => [ self::STATUS_ID, new Get_Super_Admin_Status_Ability() ],
			'execute-php' => [ self::EXECUTE_PHP_ID, new Execute_Php_Ability() ],
			'read-file' => [ self::READ_FILE_ID, new Read_File_Ability() ],
			'list-directory' => [ self::LIST_DIRECTORY_ID, new List_Directory_Ability() ],
		];
	}

	public function setUp(): void {
		parent::setUp();

		if ( ! function_exists( 'wp_get_ability' ) ) {
			$this->markTestSkipped( 'Abilities API (WP 6.9+) is not available.' );
		}
	}

	/**
	 * @dataProvider super_admin_ability_provider
	 */
	public function test_register__show_in_rest_is_false( string $ability_id, $ability ): void {
		// Arrange
		$this->ensure_elementor_category();
		$registry = \WP_Abilities_Registry::get_instance();

		if ( $registry && ! $registry->is_registered( $ability_id ) ) {
			remove_all_actions( 'wp_abilities_api_init' );

			add_action(
				'wp_abilities_api_init',
				static function () use ( $ability ) {
					$ability->register();
				}
			);

			// Act
			do_action( 'wp_abilities_api_init' );
		}

		$registered = wp_get_ability( $ability_id );
		$this->assertNotNull( $registered );

		// Assert
		$meta = $registered->get_meta();
		$this->assertIsArray( $meta );
		$this->assertArrayHasKey( 'show_in_rest', $meta );
		$this->assertFalse( $meta['show_in_rest'] );
	}

	private function ensure_elementor_category(): void {
		if ( ! function_exists( 'wp_register_ability_category' ) ) {
			return;
		}

		if ( \WP_Ability_Categories_Registry::get_instance()->is_registered( 'elementor' ) ) {
			return;
		}

		wp_register_ability_category(
			'elementor',
			[
				'label' => 'Elementor',
				'description' => 'Elementor',
			]
		);
	}
}
