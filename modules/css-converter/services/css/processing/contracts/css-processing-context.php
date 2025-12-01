<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Processing_Context {

	private $raw_css = '';
	private $processed_css = '';
	private $elements = [];
	private $widgets = [];
	private $metadata = [];
	private $statistics = [];

	public function __construct( string $raw_css = '', array $elements = [], array $widgets = [] ) {
		$this->raw_css = $raw_css;
		$this->processed_css = $raw_css;
		$this->elements = $elements;
		$this->widgets = $widgets;
	}

	public function get_raw_css(): string {
		return $this->raw_css;
	}

	public function set_raw_css( string $css ): void {
		$this->raw_css = $css;
	}

	public function get_processed_css(): string {
		return $this->processed_css;
	}

	public function set_processed_css( string $css ): void {
		$this->processed_css = $css;
	}

	public function get_elements(): array {
		return $this->elements;
	}

	public function set_elements( array $elements ): void {
		$this->elements = $elements;
	}

	public function get_widgets(): array {
		return $this->widgets;
	}

	public function set_widgets( array $widgets ): void {
		$this->widgets = $widgets;
	}

	public function get_metadata( string $key, $default = null ) {
		return $this->metadata[ $key ] ?? $default;
	}

	public function set_metadata( string $key, $value ): void {
		$this->metadata[ $key ] = $value;
	}

	public function has_metadata( string $key ): bool {
		return isset( $this->metadata[ $key ] );
	}

	public function get_all_metadata(): array {
		return $this->metadata;
	}

	public function get_statistics(): array {
		return $this->statistics;
	}

	public function add_statistic( string $key, $value ): void {
		$this->statistics[ $key ] = $value;
	}

	public function increment_statistic( string $key, int $amount = 1 ): void {
		$current = $this->statistics[ $key ] ?? 0;
		$this->statistics[ $key ] = $current + $amount;
	}

	public function get_statistic( string $key, $default = 0 ) {
		return $this->statistics[ $key ] ?? $default;
	}
}
