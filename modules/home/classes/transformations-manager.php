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

	protected array $home_screen_data;

	protected Wordpress_Adapter $wordpress_adapter;

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
		$this->wordpress_adapter = new Wordpress_Adapter();
	}

	public function run_transformations(): array {
		$transformations = self::TRANSFORMATIONS;

		foreach ( $transformations as $transformation ) {
			$this->home_screen_data = $this->run_transformation( $transformation );
		}

		return $this->home_screen_data;
	}

	private function run_transformation( $id ): array {
		$class_name = '\\Elementor\\Modules\\Home\\Transformations\\' . $id;
		$transformer = new $class_name( $this->home_screen_data, $this->wordpress_adapter );

		return $transformer->transform();
	}
}
