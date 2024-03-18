<?php
namespace Elementor\Modules\Home\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Transformations_Manager {

	private const TRANSFORMATIONS = [
		'Create_New_Page_Url',
		'Filter_Plugins',
	];

	public array $home_screen_data;

	protected Wordpress_Adapter $wordpress_adapter;

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
		$this->wordpress_adapter = new Wordpress_Adapter();

		$this->run_transformations();
	}

	private function run_transformations(): void {
		$transformations = self::TRANSFORMATIONS;

		foreach ( $transformations as $transformation ) {
			$this->home_screen_data = $this->run_transformation( $transformation );
		}
	}

	private function run_transformation( $id ): array {
		$class_name = '\\Elementor\\Modules\\Home\\Transformations\\' . $id;
		$transformer = new $class_name( $this->home_screen_data, $this->wordpress_adapter );

		return $transformer->transform();
	}

	public function get_data(): array {
		return $this->home_screen_data;
	}
}
