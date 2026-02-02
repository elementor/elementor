<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Document;

class Widget_Creation_Context {
	private array $styled_widgets;
	private array $css_processing_result;
	private array $options;
	private ?int $post_id = null;
	private ?Document $document = null;
	private array $processed_widgets = [];
	private array $elementor_elements = [];
	private array $hierarchy_stats = [];

	public function __construct( array $styled_widgets, array $css_processing_result, array $options = [] ) {
		$this->styled_widgets = $styled_widgets;
		$this->css_processing_result = $css_processing_result;
		$this->options = $options;
		$this->post_id = $options['postId'] ?? null;
	}

	public function get_styled_widgets(): array {
		return $this->styled_widgets;
	}

	public function get_css_processing_result(): array {
		return $this->css_processing_result;
	}

	public function get_options(): array {
		return $this->options;
	}

	public function get_post_id(): ?int {
		return $this->post_id;
	}

	public function set_post_id( int $post_id ): void {
		$this->post_id = $post_id;
	}

	public function get_post_type(): string {
		return $this->options['postType'] ?? 'page';
	}

	public function get_document(): ?Document {
		return $this->document;
	}

	public function set_document( Document $document ): void {
		$this->document = $document;
	}

	public function get_processed_widgets(): array {
		return $this->processed_widgets;
	}

	public function set_processed_widgets( array $processed_widgets ): void {
		$this->processed_widgets = $processed_widgets;
	}

	public function get_elementor_elements(): array {
		return $this->elementor_elements;
	}

	public function set_elementor_elements( array $elementor_elements ): void {
		$this->elementor_elements = $elementor_elements;
	}

	public function get_hierarchy_stats(): array {
		return $this->hierarchy_stats;
	}

	public function set_hierarchy_stats( array $hierarchy_stats ): void {
		$this->hierarchy_stats = $hierarchy_stats;
	}

	public function get_use_zero_defaults(): bool {
		return $this->options['use_zero_defaults'] ?? false;
	}
}
