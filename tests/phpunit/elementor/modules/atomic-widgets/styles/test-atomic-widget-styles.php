<?php
namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Cache_Validity;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Styles_Manager;
use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Widget_Base;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../props-factory.php';

class Test_Atomic_Widget_Styles extends Elementor_Test_Base {
	use MatchesSnapshots;

	private $mock_styles_manager;

	public function set_up() {
		parent::set_up();

		$this->mock_styles_manager = $this->createMock( Atomic_Styles_Manager::class );

		remove_all_actions( 'elementor/atomic-widgets/styles/register' );
	}

	public function test_register_styles__registers_styles_for_atomic_widgets() {
		// Arrange.
		$atomic_widget_styles = new Atomic_Widget_Styles();
		$atomic_widget_styles->register_hooks();

		$element_1 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style-1',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'red',
								'font-size' => '16px',
							],
							'meta' => [],
						],
					],
				],
				[
					'id' => 'test-style-2',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'blue',
								'font-weight' => 'bold',
							],
							'meta' => [],
						],
					],
				],
			],
		]);
		$element_2 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style-3',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'green',
								'font-size' => '18px',
							],
							'meta' => [],
						],
					],
				],
			],
		]);

		$doc_1_id = $this->make_mock_post([
			$element_1->get_raw_data(),
			$element_2->get_raw_data(),
		]);

		$element_3 = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style-4',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'yellow',
								'font-size' => '20px',
							],
							'meta' => [],
						],
					],
				],
			],
		]);
		$doc_2_id = $this->make_mock_post([
			$element_3->get_raw_data(),
		]);

		// Assert.
		$invoked_count = $this->exactly( 2 );
		$this->mock_styles_manager
			->expects( $invoked_count )
			->method( 'register' )
			->willReturnCallback(function( $key, $callback ) use ( $element_1, $element_2, $element_3, $doc_1_id, $doc_2_id, $invoked_count ) {
				switch ( $invoked_count->getInvocationCount() ) {
					case 1:
						$this->assertEquals( Atomic_Widget_Styles::STYLES_KEY . '-' . $doc_1_id, $key );
						$this->callback( function( $callback ) use ( $element_1, $element_2, $doc_1_id ) {
							$styles = $callback();

							$this->assertEquals(
								array_merge(
									$element_1->get_raw_data()['styles'],
									$element_2->get_raw_data()['styles']
								),
								$styles
							);
						});
						break;
					case 2:
						$this->assertEquals( Atomic_Widget_Styles::STYLES_KEY . '-' . $doc_2_id, $key );
						$this->callback( function( $callback ) use ( $element_3, $doc_2_id ) {
							$styles = $callback();
							$this->assertEquals( $element_3->get_raw_data()['styles'], $styles );
						});
						break;
				}
			});

		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_styles_manager, [ $doc_1_id, $doc_2_id ] );
	}

	public function test_register_styles__does_not_register_styles_for_non_atomic_widgets() {
		// Arrange.
		$atomic_widget_styles = new Atomic_Widget_Styles();
		$atomic_widget_styles->register_hooks();
		$element = $this->make_mock_non_atomic_widget([
			'settings' => [],
			'styles' => [
				[
					'id' => 'test-style',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'red',
								'font-size' => '16px',
							],
							'meta' => [],
						],
					],
				],
			],
		]);
		$atomic_element = $this->make_mock_widget([
			'controls' => [],
			'props_schema' => [],
			'settings' => [],
			'styles' => [
				[
					'id' => 'atomic-style',
					'type' => 'class',
					'variants' => [
						[
							'props' => [
								'color' => 'blue',
								'font-size' => '20px',
							],
							'meta' => [],
						],
					],
				],
			],
		]);
		$doc_id = $this->make_mock_post([
			$element->get_raw_data(),
			$atomic_element->get_raw_data(),
		]);

		// Assert.
		$this->mock_styles_manager
			->expects( $this->once() )
			->method( 'register' )
			->with(
				Atomic_Widget_Styles::STYLES_KEY . '-' . $doc_id,
				$this->callback(function( $callback ) use ( $element, $atomic_element ) {
					$styles = $callback();
					$expected = $atomic_element->get_raw_data()['styles'];
					$this->assertEquals( $expected, $styles );
					return true;
				})
			);

		// Act.
		do_action( 'elementor/atomic-widgets/styles/register', $this->mock_styles_manager, [ $doc_id ] );
	}

	public function test_cache_invalidation_on_global_cache_clear() {
		// Arrange.
		( new Atomic_Widget_Styles() )->register_hooks();
		$doc = $this->factory()->documents->create_and_get();
		$id = $doc->get_id();

		$cache_validity = new Cache_Validity();

		// Act.
		$cache_validity->validate( [ Atomic_Widget_Styles::STYLES_KEY, $id ] );

		// Assert.
		$this->assertTrue( $cache_validity->is_valid( [ Atomic_Widget_Styles::STYLES_KEY, $id ] ) );

		// Act.
		do_action( 'elementor/document/after_save', $doc, [] );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid( [ Atomic_Widget_Styles::STYLES_KEY, $id ] ) );

		// Act.
		do_action( 'elementor/core/files/clear_cache' );

		// Assert.
		$this->assertFalse( $cache_validity->is_valid( [ Atomic_Widget_Styles::STYLES_KEY ] ) );
	}

	private function make_mock_post( $elements_data = [] ) {
		$doc = $this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => $elements_data,
			],
		] );

		return $doc->get_id();
	}

	/**
	 * @param array{controls: array, props_schema: array, settings: array} $options
	 */
	private function make_mock_widget( array $options ): Atomic_Widget_Base {
		return new class( $options ) extends Atomic_Widget_Base {
			private static array $options;

			public function __construct( $options ) {
				self::$options = $options;

				parent::__construct( [
					'id' => 1,
					'settings' => $options['settings'] ?? [],
					'styles' => $options['styles'] ?? [],
					'elType' => 'widget',
					'widgetType' => 'e-heading',
				], [] );
			}

			public static function get_element_type(): string {
				return 'e-heading';
			}

			protected function define_atomic_controls(): array {
				return self::$options['controls'] ?? [];
			}

			protected static function define_props_schema(): array {
				return self::$options['props_schema'] ?? [];
			}

			public function define_base_styles(): array {
				return self::$options['base_styles'] ?? [];
			}
		};
	}

	private function make_mock_non_atomic_widget( array $options = [] ): Widget_Base {
		return new class() extends Widget_Base {
			public function get_name() {
				return 'test-widget-invalid';
			}

			public function get_raw_data( $with_html_content = false ) {
				$settings = [];
				$styles = $options['styles'] ?? [];
				$settings['styles']  = $styles;
				return $settings;
			}
		};
	}
}
