<?php

namespace Elementor\Modules\GlobalClasses\Usage;

class Css_Class_Usage {

	private string $class_id;
	private int $total = 0;
	private array $pages = [];

	public function __construct( string $class_id ) {
		$this->class_id = $class_id;
	}

	/**
	 * Tracks usage of a class in a specific page.
	 *
	 * @param int $page_id
	 * @param string $page_title
	 * @param string $element_id
	 * @param string|null $document_type Optional: 'header', 'footer', 'page', etc.
	 */
	public function track_usage( int $page_id, string $page_title, string $element_id, ?string $document_type = null ): void {
		$this->total++;

		if ( ! isset( $this->pages[ $page_id ] ) ) {
			$this->pages[ $page_id ] = [
				'title'    => $page_title,
				'total'    => 0,
				'elements' => [],
			];

			if ( $document_type ) {
				$this->pages[ $page_id ]['type'] = $document_type;
			}
		}

		$this->pages[ $page_id ]['total']++;
		$this->pages[ $page_id ]['elements'][] = $element_id;
	}

	public function merge( Css_Class_Usage $other ): void {
		if ( $other->get_class_id() !== $this->class_id ) {
			throw new \InvalidArgumentException( 'Mismatched class ID' );
		}

		$this->total += $other->get_total_usage();

		foreach ( $other->get_pages() as $page_id => $data ) {
			if ( ! isset( $this->pages[ $page_id ] ) ) {
				$this->pages[ $page_id ] = $data;
			} else {
				$this->pages[ $page_id ]['total'] += $data['total'];
				$this->pages[ $page_id ]['elements'] = array_merge(
					$this->pages[ $page_id ]['elements'],
					$data['elements']
				);

				// Merge type if not already set
				if ( empty( $this->pages[ $page_id ]['type'] ) && ! empty( $data['type'] ) ) {
					$this->pages[ $page_id ]['type'] = $data['type'];
				}
			}
		}
	}

	public function get_class_id(): string {
		return $this->class_id;
	}

	public function get_total_usage(): int {
		return $this->total;
	}


	public function get_pages(): array {
		return $this->pages;
	}
}
