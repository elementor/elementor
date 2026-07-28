<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Structure_Validator {

	const FORM_ELEMENT_TYPE = 'e-form';

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
		$parent = $node->parentNode;

		while ( $parent instanceof \DOMElement ) {
			if ( Xml_Parser::COMPOSITION_ROOT_TAG === strtolower( $parent->tagName ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
				break;
			}

			if ( self::FORM_ELEMENT_TYPE === strtolower( $parent->tagName ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
				return true;
			}

			$parent = $parent->parentNode;
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

	private function is_form_element( array $node ): bool {
		return self::FORM_ELEMENT_TYPE === ( $node['elType'] ?? '' );
	}
}
