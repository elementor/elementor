<?php
namespace Elementor\Modules\Home\Classes;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Announcements\Classes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Transformations_Manager {

	private const TRANSFORMATIONS = [
		'Create_New_Page_Url',
		'Filter_Plugins',
		'Remove_Sidebar_Upgrade_For_Pro_Users',
	];

	protected array $home_screen_data;

	protected Wordpress_Adapter $wordpress_adapter;

	protected array $transformation_classes = [];

	public function __construct( $home_screen_data ) {
		$this->home_screen_data = $home_screen_data;
		$this->wordpress_adapter = new Wordpress_Adapter();
		$this->transformation_classes = $this->set_transformation_classes();
	}

	public function run_transformations(): array {
		$transformations = self::TRANSFORMATIONS;

		foreach ( $transformations as $transformation ) {
			$this->home_screen_data = $this->run_transformation( $transformation );
		}

		return $this->home_screen_data;
	}

	private function run_transformation( $transformation_id ): array {
		return $this->transformation_classes[ $transformation_id ]->transform();
	}

	private function set_transformation_classes(): array {
		$classes = [];

		$transformations = self::TRANSFORMATIONS;

		$arguments = [
			'home_screen_data' => $this->home_screen_data,
			'wordpress_adapter' => $this->wordpress_adapter,
			'has_pro' => Utils::has_pro(),
		];

		foreach ( $transformations as $transformation_id ) {
			$class_name = '\\Elementor\\Modules\\Home\\Transformations\\' . $transformation_id;
			$classes[ $transformation_id ] = new $class_name( $arguments );
		}

		return $classes;
	}
}
