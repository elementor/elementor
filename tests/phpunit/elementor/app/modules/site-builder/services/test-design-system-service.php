<?php
namespace Elementor\Testing\App\Modules\SiteBuilder\Services;

use Elementor\App\Modules\SiteBuilder\Services\Design_System_Service;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Constants as Variables_Constants;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group site-builder
 */
class Test_Design_System_Service extends Elementor_Test_Base {

	private $kit;

	private $mock_global_classes = [
		'items' => [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'heading',
				'variants' => [],
			],
			'g-2' => [
				'id' => 'g-2',
				'label' => 'subheading',
				'variants' => [],
			],
		],
		'order' => [ 'g-1', 'g-2' ],
	];

	private $mock_global_variables = [
		'data' => [
			'e-gv-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => '#a04343',
			],
			'e-gv-2' => [
				'type' => 'global-color-variable',
				'label' => 'Secondary',
				'value' => '#34a043',
			],
		],
		'watermark' => 7,
		'version' => 1,
	];

	public function setUp(): void {
		parent::setUp();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->kit->delete_meta( Variables_Constants::VARIABLES_META_KEY );

		parent::tearDown();
	}

	public function test_deploy_global_classes__writes_via_repository_and_returns_counts() {
		$result = ( new Design_System_Service( $this->kit ) )
			->deploy_global_classes( $this->mock_global_classes );

		$this->assertEquals( [
			'items' => 2,
			'order' => 2,
		], $result );

		$stored = Global_Classes_Repository::make( $this->kit )
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->all( true )
			->get();

		$this->assertEquals( $this->mock_global_classes['items'], $stored['items'] );
		$this->assertEquals( $this->mock_global_classes['order'], $stored['order'] );
	}

	public function test_deploy_global_classes__handles_missing_keys_gracefully() {
		$result = ( new Design_System_Service( $this->kit ) )
			->deploy_global_classes( [] );

		$this->assertEquals( [
			'items' => 0,
			'order' => 0,
		], $result );

		$stored = Global_Classes_Repository::make( $this->kit )
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->all( true )
			->get();

		$this->assertEquals( [], $stored['items'] );
		$this->assertEquals( [], $stored['order'] );
	}

	public function test_deploy_global_variables__persists_via_variables_repository() {
		$service = new Design_System_Service( $this->kit );

		$result = $service->deploy_global_variables( $this->mock_global_variables );

		$collection = ( new Variables_Repository( $this->kit ) )->load();
		$variables = $collection->all();

		$this->assertCount( 2, $variables );
		$this->assertEquals( 'Primary', $collection->get( 'e-gv-1' )->label() );
		$this->assertEquals( 'Secondary', $collection->get( 'e-gv-2' )->label() );

		$this->assertSame( 2, $result['data'] );
		$this->assertSame( 1, $result['version'] );
		$this->assertSame( $this->mock_global_variables['watermark'] + 1, $result['watermark'] );
		$this->assertSame( $this->mock_global_variables['watermark'] + 1, $collection->watermark() );
	}

	public function test_deploy_global_variables__defaults_watermark_and_version_when_missing() {
		$service = new Design_System_Service( $this->kit );

		$result = $service->deploy_global_variables( [
			'data' => [
				'e-gv-1' => [
					'type' => 'global-color-variable',
					'label' => 'Primary',
					'value' => '#a04343',
				],
			],
		] );

		$collection = ( new Variables_Repository( $this->kit ) )->load();

		$this->assertSame( 1, $result['data'] );
		$this->assertSame( Variables_Constants::FORMAT_VERSION_V1, $result['version'] );
		$this->assertSame( 1, $result['watermark'] );
		$this->assertSame( 1, $collection->watermark() );
	}

	public function test_deploy_global_variables__throws_on_invalid_variable_payload() {
		$this->expectException( \InvalidArgumentException::class );

		( new Design_System_Service( $this->kit ) )->deploy_global_variables( [
			'data' => [
				'e-gv-broken' => [
					'label' => 'Missing required keys',
				],
			],
		] );
	}
}
