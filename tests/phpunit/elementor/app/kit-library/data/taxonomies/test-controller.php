<?php
namespace Elementor\Tests\Phpunit\Elementor\App\KitLibrary\Data\Taxonomies;

use Elementor\Plugin;
use Elementor\Core\Common\Modules\Connect\Module;
use Elementor\App\Modules\KitLibrary\Data\Repository;
use Elementor\App\Modules\KitLibrary\Connect\Kit_Library;
use Elementor\App\Modules\KitLibrary\Data\Taxonomies\Controller;
use ElementorEditorTesting\Elementor_Test_Base;
use ElementorEditorTesting\Traits\Rest_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Controller extends Elementor_Test_Base {
	use Rest_Trait {
		setUp as traitSetUP;
	}

	/**
	 * @var Kit_Library
	 */
	private $app_mock;

	public function setUp(  ) {
		$this->traitSetUP();

		$this->app_mock = $this->getMockBuilder( Kit_Library::class )
			->setMethods( [ 'get_taxonomies', 'get_manifest' ] )
			->getMock();

		$module_mock = $this->getMockBuilder( Module::class )
			->setMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );
	}

	public function test_get_items() {
		$this->act_as_admin();
		$this->app_mock->method( 'get_taxonomies' )->willReturn( (object) [
			'categories' => [
				(object)[ '_id' => 100, 'name' => 'Creative' ],
				(object)[ '_id' => 100, 'name' => 'Creative' ], // validate that duplicated records removed.
				(object)[ '_id' => 101, 'name' => 'Sport' ],
				(object)[ '_id' => 102, 'name' => 'Design' ],
			],
			'tags' => [
				(object)[ '_id' => 200, 'name' => 'Decore' ],
				(object)[ '_id' => 201, 'name' => 'Creative' ],
			],
		] );

		$this->data_manager->register_controller( new Controller( $this ) );

		// Act
		$result = $this->http_get( 'kit-taxonomies', [ 'force' => true ] );

		// Assert
		$subscription_plans = Plugin::$instance->common->get_component( 'connect' )->get_subscription_plans();

		$this->assertArrayHasKey( 'data', $result );
		$this->assertCount( 7, $result['data'] );
		$this->assertEqualSets( [
			[
				'text' => 'Creative',
				'type' => 'categories',
			],
			[
				'text' => 'Sport',
				'type' => 'categories',
			],
			[
				'text' => 'Design',
				'type' => 'categories',
			],
			[
				'text' => 'Decore',
				'type' => 'tags',
			],
			[
				'text' => 'Creative',
				'type' => 'tags',
			],
			// Subscription plans added as taxonomies locally and not from server
			[
				'text' => Repository::SUBSCRIPTION_PLAN_FREE_TAG,
				'type' => 'subscription_plans'
			],
			[
				'text' => $subscription_plans[Module::ACCESS_LEVEL_PRO]['label'],
				'type' => 'subscription_plans'
			],
		], $result['data'] );
	}
}
