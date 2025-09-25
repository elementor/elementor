<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Id_Generator {
	
	private array $generated_ids = [];
	
	public function generate_widget_id(): string {
		do {
			$id = $this->create_unique_id();
		} while ( $this->is_id_taken( $id ) );
		
		$this->generated_ids[] = $id;
		
		return $id;
	}
	
	public function generate_class_id( string $widget_id ): string {
		$base_id = 'e-' . substr( $widget_id, 0, 8 ) . '-' . substr( md5( $widget_id ), 0, 7 );
		
		$counter = 1;
		$class_id = $base_id;
		
		while ( $this->is_id_taken( $class_id ) ) {
			$class_id = $base_id . '-' . $counter;
			$counter++;
		}
		
		$this->generated_ids[] = $class_id;
		
		return $class_id;
	}
	
	private function create_unique_id(): string {
		return sprintf(
			'%08x-%04x-%04x-%04x-%012x',
			mt_rand( 0, 0xffffffff ),
			mt_rand( 0, 0xffff ),
			mt_rand( 0, 0x0fff ) | 0x4000,
			mt_rand( 0, 0x3fff ) | 0x8000,
			mt_rand( 0, 0xffffffffffff )
		);
	}
	
	private function is_id_taken( string $id ): bool {
		return in_array( $id, $this->generated_ids, true );
	}
	
	public function reset(): void {
		$this->generated_ids = [];
	}
	
	public function get_generated_ids(): array {
		return $this->generated_ids;
	}
}
