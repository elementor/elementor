<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Structure_Validator {

	const FORM_ELEMENT_TYPE = 'e-form';

	// Mirror the Pro-only e-form-honeypot and e-form-recaptcha-score widgets (same precedent as e-form-hidden).
	const HONEYPOT_ELEMENT_TYPE = 'e-form-honeypot';
	const RECAPTCHA_SCORE_ELEMENT_TYPE = 'e-form-recaptcha-score';

	// Element type => plural label used in error messages.
	const SINGLE_INSTANCE_ELEMENT_TYPES = [
		self::HONEYPOT_ELEMENT_TYPE => 'honeypots',
		self::RECAPTCHA_SCORE_ELEMENT_TYPE => 'reCAPTCHA Score atoms',
	];

	const FORM_FIELD_ELEMENT_TYPES = [
		'e-form-input',
		'e-form-textarea',
		'e-form-label',
		'e-form-checkbox',
		'e-form-submit-button',
		'e-form-select',
		'e-form-radio-button',
		'e-form-file-upload',
		'e-form-date-picker',
		'e-form-time-picker',
		'e-form-hidden',
		self::HONEYPOT_ELEMENT_TYPE,
		self::RECAPTCHA_SCORE_ELEMENT_TYPE,
	];

	private const DEFAULT_PARENT_ID = 'document';

	private Xml_Parser $xml_parser;

	public function __construct( ?Xml_Parser $xml_parser = null ) {
		$this->xml_parser = $xml_parser ?? new Xml_Parser();
	}

	/**
	 * @return \WP_Error|null
	 */
	public function validate( \DOMDocument $dom, array $document_tree, string $parent_id ) {
		$errors = $this->collect_errors( $dom, $document_tree, $parent_id );

		if ( empty( $errors ) ) {
			return null;
		}

		return new \WP_Error(
			'elementor_invalid_form_structure',
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	/**
	 * @return string[]
	 */
	public function collect_errors( \DOMDocument $dom, array $document_tree, string $parent_id ): array {
		$parent_within_form = $this->is_parent_within_existing_form( $document_tree, $parent_id );

		return array_merge(
			$this->collect_nested_form_errors( $dom, $parent_within_form ),
			$this->collect_form_ancestor_errors( $dom, $parent_within_form ),
			$this->collect_submit_button_errors( $dom ),
			$this->collect_single_instance_errors( $dom, $document_tree, $parent_id ),
			$this->collect_empty_message_errors( $dom )
		);
	}

	/**
	 * @return string[]
	 */
	private function collect_nested_form_errors( \DOMDocument $dom, bool $parent_within_form ): array {
		$errors = [];

		foreach ( $this->xml_parser->iterate_all_descendants( $dom ) as $node ) {
			$tag = strtolower( $this->xml_parser->get_tag_name( $node ) );

			if ( self::FORM_ELEMENT_TYPE !== $tag ) {
				continue;
			}

			if ( ! $parent_within_form && ! $this->has_form_ancestor_in_dom( $node ) ) {
				continue;
			}

			$errors[] = '<' . $this->xml_parser->get_tag_name( $node ) . '> cannot be nested inside another <e-form>.';
		}

		return $errors;
	}

	/**
	 * @return string[]
	 */
	private function collect_form_ancestor_errors( \DOMDocument $dom, bool $parent_within_form ): array {
		if ( $parent_within_form ) {
			return [];
		}

		$errors = [];

		foreach ( $this->xml_parser->iterate_all_descendants( $dom ) as $node ) {
			$tag = strtolower( $this->xml_parser->get_tag_name( $node ) );

			if ( ! in_array( $tag, self::FORM_FIELD_ELEMENT_TYPES, true ) ) {
				continue;
			}

			if ( $this->has_form_ancestor_in_dom( $node ) ) {
				continue;
			}

			$errors[] = $this->form_field_must_be_in_form_error(
				$tag,
				$this->xml_parser->get_configuration_id( $node )
			);
		}

		return $errors;
	}

	/**
	 * @return string[]
	 */
	private function collect_submit_button_errors( \DOMDocument $dom ): array {
		$errors = [];
		$xpath = new \DOMXPath( $dom );

		foreach ( $xpath->query( '//' . self::FORM_ELEMENT_TYPE ) as $form ) {
			if ( ! $form instanceof \DOMElement ) {
				continue;
			}

			$submit_buttons = $xpath->query( './/e-form-submit-button', $form );
			$submit_button_count = $submit_buttons ? $submit_buttons->length : 0;

			if ( 0 === $submit_button_count ) {
				$errors[] = '<e-form> has no <e-form-submit-button>.';
			} elseif ( $submit_button_count > 1 ) {
				$errors[] = '<e-form> has ' . $submit_button_count . ' submit buttons — only 1 is allowed.';
			}
		}

		return $errors;
	}

	/**
	 * @return string[]
	 */
	private function collect_single_instance_errors( \DOMDocument $dom, array $document_tree, string $parent_id ): array {
		$errors = [];

		foreach ( self::SINGLE_INSTANCE_ELEMENT_TYPES as $type => $plural_label ) {
			$errors = array_merge(
				$errors,
				$this->collect_single_instance_type_errors( $dom, $document_tree, $parent_id, $type, $plural_label )
			);
		}

		return $errors;
	}

	/**
	 * @return string[]
	 */
	private function collect_single_instance_type_errors( \DOMDocument $dom, array $document_tree, string $parent_id, string $type, string $plural_label ): array {
		$errors = [];
		$xpath = new \DOMXPath( $dom );
		$all_instances = $xpath->query( '//' . $type );

		foreach ( $xpath->query( '//' . self::FORM_ELEMENT_TYPE ) as $form ) {
			if ( ! $form instanceof \DOMElement ) {
				continue;
			}

			$instances = $xpath->query( './/' . $type, $form );
			$instance_count = $instances ? $instances->length : 0;

			if ( 1 < $instance_count ) {
				$errors[] = '<e-form> has ' . $instance_count . ' ' . $plural_label . ' — only 1 is allowed.';
			}
		}

		$parent_form = $this->find_form_containing_node( $document_tree, $parent_id );

		if ( ! $parent_form || 0 === $this->count_element_type( $parent_form['elements'] ?? [], $type ) ) {
			return $errors;
		}

		if ( $all_instances && $all_instances->length > 0 ) {
			$errors[] = 'The target <e-form> already has an <' . $type . '> — only 1 is allowed per form.';
		}

		return $errors;
	}

	/**
	 * @return string[]
	 */
	private function collect_empty_message_errors( \DOMDocument $dom ): array {
		$errors = [];
		$xpath = new \DOMXPath( $dom );

		foreach ( $xpath->query( '//e-form-success-message|//e-form-error-message' ) as $node ) {
			if ( ! $node instanceof \DOMElement ) {
				continue;
			}

			if ( ! empty( $this->xml_parser->get_child_elements( $node ) ) ) {
				continue;
			}

			$errors[] = '<' . $this->xml_parser->get_tag_name( $node ) . '> must have at least one child element (e.g. <e-paragraph>).';
		}

		return $errors;
	}

	private function form_field_must_be_in_form_error( string $tag, ?string $configuration_id ): string {
		$configuration_attribute = $configuration_id ? ' configuration-id="' . $configuration_id . '"' : '';

		return '<' . $tag . $configuration_attribute . '> must be nested inside <e-form> (any ancestor depth is allowed).';
	}

	private function has_form_ancestor_in_dom( \DOMElement $node ): bool {
		$parent = $node->parentNode; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.

		while ( $parent instanceof \DOMElement ) {
			if ( Xml_Parser::COMPOSITION_ROOT_TAG === strtolower( $parent->tagName ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
				break;
			}

			if ( self::FORM_ELEMENT_TYPE === strtolower( $parent->tagName ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
				return true;
			}

			$parent = $parent->parentNode; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
		}

		return false;
	}

	private function is_parent_within_existing_form( array $document_tree, string $parent_id ): bool {
		if ( self::DEFAULT_PARENT_ID === $parent_id ) {
			return false;
		}

		$context = $this->locate_node_form_context( $document_tree, $parent_id );

		return $context['found'] && $context['within_form'];
	}

	/**
	 * @return array{found: bool, within_form: bool}
	 */
	private function locate_node_form_context( array $tree, string $target_id, bool $within_form = false ): array {
		foreach ( $tree as $node ) {
			$node_is_form = $within_form || $this->is_form_element( $node );
			$id = $node['id'] ?? '';

			if ( $id === $target_id ) {
				return [
					'found' => true,
					'within_form' => $node_is_form,
				];
			}

			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$result = $this->locate_node_form_context( $node['elements'], $target_id, $node_is_form );

				if ( $result['found'] ) {
					return $result;
				}
			}
		}

		return [
			'found' => false,
			'within_form' => false,
		];
	}

	private function find_form_containing_node( array $tree, string $target_id, ?array $current_form = null ): ?array {
		if ( self::DEFAULT_PARENT_ID === $target_id ) {
			return null;
		}

		foreach ( $tree as $node ) {
			$node_form = $this->is_form_element( $node ) ? $node : $current_form;

			if ( ( $node['id'] ?? '' ) === $target_id ) {
				return $node_form;
			}

			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$result = $this->find_form_containing_node( $node['elements'], $target_id, $node_form );

				if ( $result ) {
					return $result;
				}
			}
		}

		return null;
	}

	/**
	 * @return string[]
	 */
	public function collect_tree_single_instance_errors( array $tree ): array {
		$errors = [];

		foreach ( self::SINGLE_INSTANCE_ELEMENT_TYPES as $type => $plural_label ) {
			foreach ( $this->collect_form_element_counts( $tree, $type ) as $count ) {
				if ( 1 < $count ) {
					$errors[] = '<e-form> has ' . $count . ' ' . $plural_label . ' — only 1 is allowed.';
				}
			}
		}

		return $errors;
	}

	/**
	 * @return array<string, int> Map of form element id => count of elements of the given type
	 */
	public function collect_form_element_counts( array $tree, string $type ): array {
		$counts = [];
		$this->walk_tree_for_form_element_counts( $tree, $type, $counts );

		return $counts;
	}

	private function walk_tree_for_form_element_counts( array $tree, string $type, array &$counts ): void {
		foreach ( $tree as $node ) {
			if ( $this->is_form_element( $node ) ) {
				$form_id = $node['id'] ?? '';
				$counts[ $form_id ] = $this->count_element_type( $node['elements'] ?? [], $type );
				continue;
			}

			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$this->walk_tree_for_form_element_counts( $node['elements'], $type, $counts );
			}
		}
	}

	private function count_element_type( array $tree, string $type ): int {
		$count = 0;

		foreach ( $tree as $node ) {
			if ( ( $node['widgetType'] ?? '' ) === $type ) {
				++$count;
			}

			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$count += $this->count_element_type( $node['elements'], $type );
			}
		}

		return $count;
	}

	private function is_form_element( array $node ): bool {
		return self::FORM_ELEMENT_TYPE === ( $node['elType'] ?? '' );
	}
}
