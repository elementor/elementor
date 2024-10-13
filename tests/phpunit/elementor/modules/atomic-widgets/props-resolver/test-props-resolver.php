<?php
namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	/**
	 * @dataProvider data_provider__resolve__for_settings
	 */
	public function resolve__for_settings( Props_Data_Provider $data_provider ) {
		$arrange_cb = $data_provider->arrange_cb;

		$cleanup = $arrange_cb
			? $arrange_cb()
			: fn() => null;

		$result = Props_Resolver::for_settings()->resolve(
			$data_provider->prop_types,
			$data_provider->settings
		);

		$this->assertEquals( $data_provider->expected, $result );

		$cleanup();
	}

	public function data_provider__resolve__for_settings() {
		return [
			'basic usage of prop types in a widget' => [
				Props_Data_Provider::make()
					->prop_types( [
						'text' => String_Prop_Type::make()->default( 'The greatest text' ),
						'tag' => String_Prop_Type::make()->default( 'h2' ),
						'classes' => Classes_Prop_Type::make()->default( [] ),
						'image' => Image_Prop_Type::make()->default_size('medium'),
					] )
					->settings([
						'text' => 'Hello, World!',
						'classes' => [ 'class-1', 'class-2' ],
						'image' => [
							'src' => [
								'id' => null,
								'url' => 'https://localhost/image.jpg',
							],
						],
					] )
			],
		];
	}
}

class Props_Data_Provider {
	public array $settings = [];
	public array $expected = [];
	public array $prop_types = [];
	public ?\Closure $arrange_cb = null;

	public static function make() {
		return new static();
	}

	public function settings( array $settings ) {
		$this->settings = $settings;

		return $this;
	}

	public function expected( array $expected ) {
		$this->expected = $expected;

		return $this;
	}

	public function prop_types( array $prop_types ) {
		$this->prop_types = $prop_types;

		return $this;
	}

	public function arrange( \Closure $cb ) {
		$this->arrange_cb = $cb;

		return $this;
	}
}
