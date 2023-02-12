<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport;

use Elementor\App\Modules\ImportExport\Module;
use Elementor\App\Modules\ImportExport\Processes\Revert;
use Elementor\Modules\System_Info\Reporters\Server;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {
	const MOCK_KIT_ZIP_PATH = __DIR__ . '/mock/sample-kit.zip';

	private $elementor_upload_dir;
	private $elementor_upload_dir_permission;

	public function setUp() {
		parent::setUp();

		$this->elementor_upload_dir = ( new Server() )->get_system_path( Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );
		$this->elementor_upload_dir_permission = fileperms( $this->elementor_upload_dir );
	}

	public function tearDown() {
		parent::tearDown();

		// Cleanup
		chmod( $this->elementor_upload_dir, $this->elementor_upload_dir_permission );
	}

	public function test_export_kit__fails_when_elementor_uploads_has_no_writing_permissions() {
		// Expect
		$this->expectException( \Error::class );
		$this->expectExceptionMessage( Module::NO_WRITE_PERMISSIONS_KEY . 'in - ' . Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );

		// Arrange
		$elementor_uploads_dir = ( new Server() )->get_system_path( Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );

		chmod( $elementor_uploads_dir, 0000 );

		clearstatcache();

		// Act
		( new Module() )->export_kit( [] );
	}

	public function test_upload_kit__fails_when_elementor_uploads_has_no_writing_permissions() {
		// Expect
		$this->expectException( \Error::class );
		$this->expectExceptionMessage( Module::NO_WRITE_PERMISSIONS_KEY . 'in - ' . Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );

		// Arrange
		$elementor_uploads_dir = ( new Server() )->get_system_path( Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );

		chmod( $elementor_uploads_dir, 0000 );

		clearstatcache();

		// Act
		( new Module() )->upload_kit( '', '' );
	}

	public function test_import_kit__fails_when_elementor_uploads_has_no_writing_permissions() {
		// Expect
		$this->expectException( \Error::class );
		$this->expectExceptionMessage( Module::NO_WRITE_PERMISSIONS_KEY . 'in - ' . Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );

		// Arrange
		$elementor_uploads_dir = ( new Server() )->get_system_path( Server::KEY_PATH_ELEMENTOR_UPLOADS_DIR );

		chmod( $elementor_uploads_dir, 0000 );

		clearstatcache();

		// Act
		( new Module() )->import_kit( '', [] );
	}

	public function test_import_kit__by_chunks() {
		// Arrange
		$import_export_module = new Module();

		// Act
		$import = $import_export_module->import_kit( static::MOCK_KIT_ZIP_PATH, [], true );

		// Assert
		$this->assertArrayHasKey( 'session', $import );
		$this->assertArrayHasKey( 'runners', $import );
	}

	public function test_import_kit_by_runner() {
		// Arrange
		$import_settings = [
			'include' => [
				'settings',
				'content',
			]
		];
		$import_export_module = new Module();
		$import = $import_export_module->import_kit( static::MOCK_KIT_ZIP_PATH, $import_settings, true );

		$runners_result = [];
		// Act
		foreach ( $import['runners'] as $runner ) {
			$runners_result[$runner] = $import_export_module->import_kit_by_runner( $import['session'], $runner );
		}

		$last_runner = array_pop( $runners_result );

		// Assert
		foreach ( $runners_result as $runner_name => $runner_result ) {
			$this->assertEquals( $runner_name, $runner_result['runner'] );
		}

		$this->assertTrue( $last_runner['site-settings'] );
		$this->assertCount( 1, $last_runner['content']['post']['succeed'] );
		$this->assertCount( 1, $last_runner['content']['page']['succeed'] );
		$this->assertCount( 1, $last_runner['wp-content']['post']['succeed'] );
		$this->assertCount( 1, $last_runner['wp-content']['page']['succeed'] );
		$this->assertCount( 7, $last_runner['wp-content']['nav_menu_item']['succeed'] );

		self::assert_valid_import_session( $this, $import['session'] );
	}

	public function test_revert_last_imported_kit__with_import_by_runner() {
		// Arrange
		$taxonomies = get_taxonomies();

		$base_terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$base_posts = get_posts( [ 'post_type' =>  'any', 'numberposts' => -1 ] );

		$import_settings = [
			'include' => [
				'settings',
				'content',
			]
		];
		$import_export_module = new Module();
		$import = $import_export_module->import_kit( static::MOCK_KIT_ZIP_PATH, $import_settings, true );

		$runners_result = [];
		foreach ( $import['runners'] as $runner ) {
			$runners_result[$runner] = $import_export_module->import_kit_by_runner( $import['session'], $runner );
		}

		$after_import__terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$after_import__posts = get_posts( [ 'post_type' =>  'any', 'numberposts' => -1 ] );

		// Act
		$import_export_module->revert_last_imported_kit();

		// Assert
		$after_revert__terms = get_terms( [ 'taxonomy' => $taxonomies, 'hide_empty' => false ] );
		$after_revert__posts = get_posts( [ 'post_type' =>  'any', 'numberposts' => -1 ] );

		$this->assertEquals( $base_terms, $after_revert__terms );
		$this->assertNotEquals( $after_import__terms, $after_revert__terms );

		$this->assertEquals( $base_posts, $after_revert__posts );
		$this->assertNotEquals( $after_import__posts, $after_revert__posts );
	}

	/**
	 * @dataProvider get_methods_data_provider
	 */
	public function test_should_show_revert_section( $has_pro, $import_session, $should_show ) {
		// Arrange
		$mock_module = $this->getMockBuilder( Module::class )
			->setMethods( [ 'has_pro' ] )
			->getMock();

		$mock_module->expects( $this->once() )
			->method( 'has_pro' )
			->willReturn( $has_pro );

		// Act
		$should_show_revert_section = $mock_module->should_show_revert_section( $import_session );

		// Assert
		$this->assertEquals( $should_show, $should_show_revert_section );
	}

	public function test_should_show_revert_section__revert_feature_was_not_exits_on_import() {
		// Arrange
		$import_export_module = new Module();

		// Act
		$should_show_revert_section = $import_export_module->should_show_revert_section( [] );

		// Assert
		$this->assertFalse( $should_show_revert_section );
	}

	public function get_methods_data_provider() {
		return [
			'Import done without Pro active' => [
				'has_pro' => false,
				'import_session' => [
					'runners' => []
				],
				'should_show' => true,
			],
			'Import done with Pro active but without templates' => [
				'has_pro' => true,
				'import_session' => [
					'runners' => [
						'tests' => [],
					],
				],
				'should_show' => true,
			],
			'Import done with Pro active and templates were imported by the Pro runner' => [
				'has_pro' => true,
				'import_session' => [
					'runners' => [
						'templates' => [
							'not_empty' => [],
						],
					]
				],
				'should_show' => true,
			],
			'Import done with Pro active and templates were imported by the Core runner (runner not exits in the Pro) but now the Pro deactivate' => [
				'has_pro' => false,
				'import_session' => [
					'runners' => [
						'templates' => [],
					],
				],
				'should_show' => true,
			],
			'Import done with Pro active and templates were imported by the Pro runner but now the Pro deactivate' => [
				'has_pro' => false,
				'import_session' => [
					'runners' => [
						'templates' => [
							'not_empty' => [],
						],
					],
				],
				'should_show' => true,
			],
			'Import done with Pro active and templates were imported by the Core runner' => [
				'has_pro' => true,
				'import_session' => [
					'runners' => [
						'templates' => [],
					]
				],
				'should_show' => false,
			],
		];
	}

	public static function assert_valid_import_session( $instance, $session_id )
	{
		$import_session_keys = [
			'session_id',
			'kit_title',
			'kit_name',
			'kit_thumbnail',
			'kit_source',
			'user_id',
			'start_timestamp',
			'end_timestamp',
			'runners',
		];
		$import_sessions = Revert::get_import_sessions();
		$instance->assert_array_have_keys( $import_session_keys, $import_sessions[0] );

		$instance->assertEquals( $session_id, $import_sessions[0]['session_id'] );
	}
}
