<?php
namespace Elementor\Core\Admin\Base;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Metabox_Base {

	/**
	 * Get metabox name.
	 *
	 * @return string
	 */
	abstract public function get_name();

	/**
	 * Get metabox type. ( CPT ).
	 *
	 * @return string
	 */
	abstract public function get_type();

	/**
	 * Get metabox title.
	 *
	 * @return string
	 */
	abstract public function get_title();

	/**
	 * Get metabox fields, input fields & other html.
	 *
	 * @return array
	 */
	abstract public function get_fields();

	/**
	 * Get input fields, get only input fields of the metabox.
	 *
	 * @return array
	 */
	abstract public function get_input_fields();

	/**
	 * Actions, place for the filters and actions.
	 */
	protected function actions() {
		$cpt = $this->get_type();

		add_action( 'add_meta_boxes_' . $cpt, function () use ( $cpt ) {
			add_meta_box( 'elementor-' . $cpt . '-metabox', $this->get_title(), function () {
				$this->render_meta_box();
			}, $this->get_type(), 'normal', 'default' );
		} );

		add_action( 'save_post_' . $cpt, function ( $post_id, $post ) {
			return $this->save_post_meta( $post_id, $post );
		}, 10, 3 );
	}

	/**
	 * Render metabox, Handles saved values for the inputs.
	 */
	protected function render_meta_box() {
		$fields = $this->get_fields();

		if ( ! empty( $_REQUEST['action'] ) && 'edit' == $_REQUEST['action'] ) {
			$post = get_post( $_REQUEST['post'] );

			foreach ( $this->get_input_fields() as $input_field ) {
				$field_meta = get_post_meta( $post->ID, "_elementor_$input_field", true );

				if ( ! empty( $field_meta ) ) {
					$key = array_search( $input_field, array_column( $fields, 'id' ) );
					if ( false !== $key ) {
						$fields[ $key ]['saved'] = $field_meta;
					}
				}
			}
		}

		// The method, support fields only.
		$this->print_metabox( $fields );

		do_action( 'elementor-pro/metabox/render', $this, get_post() );
	}

	/**
	 * Saves post meta.
	 *
	 * @param integer $post_id
	 * @param \WP_Post $post
	 *
	 * @return mixed
	 */
	protected function save_post_meta( $post_id, $post ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		// Check the user's permissions.
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return $post_id;
		}

		if ( get_post_status( $post->ID ) === 'auto-draft' ) {
			return $post_id;
		}

		foreach ( $this->get_input_fields() as $field_name ) {
			if ( isset( $_POST[ $field_name ] ) && ! Utils::is_empty( $_POST[ $field_name ] ) ) {
				$post_meta = $this->sanitize_post_meta( $field_name, $_POST[ $field_name ] );
				update_post_meta( $post->ID, "_elementor_$field_name", $post_meta );
			}
		}

		return $post_id;
	}

	/**
	 * Sanitize post meta.
	 *
	 * @param string $field_name - Input field name.
	 * @param mixed $post_meta - Post meta value.
	 * @param bool $is_sanitize_meta - Should sanitize? default 'true'.
	 *
	 * @return string
	 */
	protected function sanitize_post_meta( $field_name, $post_meta, $is_sanitize_meta = true ) {
		if ( $is_sanitize_meta ) {
			$post_meta = sanitize_text_field( $post_meta );
		}

		if ( ! current_user_can( 'unfiltered_html' ) ) {
			$post_meta = wp_kses_post( $post_meta );
		}

		return $post_meta;
	}

	/**
	 * Sanitize text field recursive.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param mixed $data
	 *
	 * @return array|string
	 */
	protected function sanitize_text_field_recursive( $data ) {
		if ( is_array( $data ) ) {
			foreach ( $data as $key => $value ) {
				$data[ $key ] = $this->sanitize_text_field_recursive( $value );
			}

			return $data;
		}

		return sanitize_text_field( $data );
	}

	/**
	 * Get metabox field HTML.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 * @param string $saved
	 *
	 * @return mixed
	 */
	public function get_metabox_field_html( $field, $saved ) {
		$html = '';

		switch ( $field['field_type'] ) {
			case 'html':
				$html = $this->get_html_field( $field );

				return $html;

			case 'html_tag':
				$html = $this->get_html_tag( $field );

				return $html;

			case 'toolbar':
				$html = $this->get_repeater_tools( $field );
				break;

			case 'input':
				$html = $this->get_input_field( $field );
				break;

			case 'select':
				$html = $this->get_select_field( $field, $saved );
				break;

			case 'textarea':
				$html = $this->get_textarea_field( $field, $saved );
				break;

			case 'file':
				$html = $this->get_file_field( $field, $saved );
				break;

			case 'repeater':
				$html = $this->get_repeater_field( $field, $saved );
				break;

			case 'dropzone':
				$html = $this->get_dropzone_field( $field );
				break;

			default:
				$method = 'get_' . $field['field_type'] . 'field';
				if ( method_exists( $this, $method ) ) {
					$html = call_user_func( [ $this, $method ], $field, $saved );
				}
				break;
		}

		return $this->get_field_row( $field, $html );
	}

	/**
	 * Get field label.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 *
	 * @return string
	 */
	public function get_field_label( $field ) {
		if ( ! isset( $field['label'] ) || false === $field['label'] ) {
			return '';
		}
		$id = $field['id'];
		if ( 'file' === $field['field_type'] ) {
			$id .= $field['field_type'];
		}

		return '<p class="elementor-field-label"><label for="' . esc_attr( $id ) . '">' . $field['label'] . '</label></p>';
	}

	/**
	 * Get input field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $attributes
	 *
	 * @return string
	 */
	protected function get_input_field( $attributes ) {
		if ( isset( $attributes['input_type'] ) ) {
			$attributes['type'] = $attributes['input_type'];
			unset( $attributes['input_type'] );
		}

		return '<input ' . $this->get_attribute_string( $attributes ) . '>';
	}

	/**
	 * Get attribute string.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $attributes
	 * @param array $field
	 *
	 * @return string
	 */
	protected function get_attribute_string( $attributes, $field = [] ) {
		if ( isset( $field['extra_attributes'] ) && is_array( $field['extra_attributes'] ) ) {
			$attributes = array_merge( $attributes, $field['extra_attributes'] );
		}
		$attributes_array = [];
		foreach ( $attributes as $name => $value ) {
			$attributes_array[] = sprintf( '%s="%s"', $name, esc_attr( $value ) );
		}

		return implode( ' ', $attributes_array );
	}

	/**
	 * Get select field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 * @param string $selected
	 *
	 * @return string
	 */
	protected function get_select_field( $field, $selected = '' ) {
		$input = '<select ';
		$input .= $this->get_attribute_string( [
			'name' => $field['id'],
			'id' => $field['id'],
		], $field );

		$input .= '>' . "\n";
		foreach ( $field['options'] as $value => $label ) {
			$input .= '<option value="' . $value . '" ' . selected( $selected, $value, false ) . '>' . esc_attr( $label ) . '</option>' . PHP_EOL;
		}

		return $input . '</select>';
	}

	/**
	 * Get textarea field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 * @param string $html
	 *
	 * @return string
	 */
	protected function get_textarea_field( $field, $html ) {
		$input = '<textarea ';
		$input .= $this->get_attribute_string( [
			'name' => $field['id'],
			'id' => $field['id'],
		], $field );

		$input .= '>' . esc_textarea( $html ) . '</textarea>';

		return $input;
	}

	/**
	 * Get file field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 * @param string $saved
	 *
	 * @return string
	 */
	protected function get_file_field( $field, $saved ) {
		$value = [
			'id' => '',
			'url' => '',
		];

		if ( isset( $saved['id'] ) && isset( $saved['url'] ) ) {
			$value = $saved;
		}

		$html = '<ul></ul>';
		$html .= $this->get_input_field( [
			'type' => 'hidden',
			'name' => $field['id'] . '[id]',
			'value' => $value['id'],
		] );

		$html .= $this->get_input_field( [
			'type' => 'text',
			'name' => $field['id'] . '[url]',
			'value' => $value['url'],
			'placeholder' => $field['description'],
			'class' => 'elementor-field-input',
		] );

		$html .= $this->get_input_field( [
			'type' => 'button',
			'class' => 'button elementor-button elementor-upload-btn',
			'name' => $field['id'],
			'id' => $field['id'],
			'value' => '',
			'data-preview_anchor' => isset( $field['preview_anchor'] ) ? $field['preview_anchor'] : 'none',
			'data-mime_type' => isset( $field['mine'] ) ? $field['mine'] : '',
			'data-ext' => isset( $field['ext'] ) ? $field['ext'] : '',
			'data-upload_text' => __( 'Upload', 'elementor-pro' ),
			'data-remove_text' => __( 'Delete', 'elementor-pro' ),
			'data-box_title' => isset( $field['box_title'] ) ? $field['box_title'] : '',
			'data-box_action' => isset( $field['box_action'] ) ? $field['box_action'] : '',
		] );

		return $html;
	}

	/**
	 * Get html field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 *
	 * @return mixed
	 */
	protected function get_html_field( $field ) {
		return $field['raw_html'];
	}

	/**
	 * Get dropzone field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 *
	 * @return false|string
	 */
	protected function get_dropzone_field( $field ) {
		ob_start();
		$input_attributes = [
			'type' => 'file',
			'name' => $field['id'],
			'id' => $field['id'],
			'accept' => $field['accept'],
			'class' => 'box__file',
		];
		if ( ! empty( $field['multiple'] ) ) {
			$input_attributes['multiple'] = true;
		}
		$input_html = $this->get_input_field( $input_attributes );
		$field['label'] = '<h4><span class="box__dragndrop">' . __( 'Drag & Drop to Upload', 'elementor-pro' ) . '</span></h4>';
		if ( ! empty( $field['sub-label'] ) ) {
			$field['label'] .= '<h5>' . $field['sub-label'] . '</h5>';
		}
		?>
		<div class="elementor-dropzone-field">
			<div class="box__input">
				<div class="elementor--dropzone--upload__icon">
					<i class="eicon-library-upload"></i>
				</div>
				<?php echo $input_html; ?>
				<?php echo $this->get_field_label( $field ); ?>
				<div class="elementor-button elementor--dropzone--upload__browse">
					<span><?php esc_html_e( 'Click here to browse', 'elementor-pro' ); ?></span>
				</div>
			</div>
			<div class="box__uploading"><?php esc_html_e( 'Uploading&hellip;', 'elementor-pro' ); ?></div>
			<div class="box__success"><?php esc_html_e( 'Done!', 'elementor-pro' ); ?></div>
			<div class="box__error"><?php esc_html_e( 'Error!', 'elementor-pro' ); ?> <span></span>.</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get repeater field.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 * @param string $saved
	 *
	 * @return false|string
	 */
	protected function get_repeater_field( $field, $saved ) {
		$id = $field['id'];
		$js_id = 'repeater_' . Utils::generate_random_string();
		$add_label = isset( $field['add_label'] ) ? $field['add_label'] : __( 'Add item', 'elementor-pro' );
		$row_label = isset( $field['row_label'] ) ? $field['row_label'] : __( 'Row', 'elementor-pro' );
		$row_label_html_args = [
			'id' => 'row_label_' . $js_id,
			'class' => 'repeater-title hidden',
		];

		if ( is_array( $row_label ) ) {
			$label = $row_label['default'];
			$row_label_html_args['data-default'] = $row_label['default'];
			$row_label_html_args['data-selector'] = $row_label['selector'];
		} else {
			$label = $row_label;
			$row_label_html_args['data-default'] = $row_label;
		}

		$row_label_html = '<span ' . $this->get_attribute_string( $row_label_html_args ) . '>' . $label . '</span>';
		ob_start();
		?>
		<script type="text/template" id="<?php echo esc_attr( $js_id . '_block' ); ?>">
			<div class="repeater-block block-visible">
				<?php
				echo $row_label_html;
				echo $this->get_repeater_tools( $field );
				?>
				<div class="repeater-content form-table">
					<?php
					foreach ( $field['fields'] as $sub_field ) {
						$sub_field['real_id'] = $id;
						$sub_field['id'] = $id . '[__counter__][' . $sub_field['id'] . ']';
						echo $this->get_metabox_field_html( $sub_field, '' );
					}
					?>
				</div>
			</div>
		</script>
		<?php
		$counter = 0;
		$row_label_html_args['class'] = 'repeater-title';

		$row_label_html = '<span ' . $this->get_attribute_string( $row_label_html_args ) . '>' . $label . '</span>';
		if ( is_array( $saved ) && count( $saved ) > 0 ) {
			foreach ( (array) $saved as $key => $item ) {
				echo '<div class="repeater-block">';
				echo $row_label_html;
				echo $this->get_repeater_tools( $field );
				echo '<div class="repeater-content hidden form-table">';
				foreach ( $field['fields'] as $sub_field ) {
					$default = isset( $sub_field['default'] ) ? $sub_field['default'] : '';
					$item_meta = isset( $item[ $sub_field['id'] ] ) ? $item[ $sub_field['id'] ] : $default;
					$sub_field['real_id'] = $sub_field['id'];
					$sub_field['id'] = $id . '[' . $counter . '][' . $sub_field['id'] . ']';
					echo $this->get_metabox_field_html( $sub_field, $item_meta );
				}
				echo '</div>'; // end table
				echo '</div>';
				$counter++;
			}
		}
		echo '<input type="button" class="button elementor-button add-repeater-row" value="' . esc_attr( $add_label ) . '" data-template-id="' . $js_id . '_block">';

		return ob_get_clean();
	}

	/**
	 * Get HTML tag.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 *
	 * @return string
	 */
	protected function get_html_tag( $field ) {
		$tag = isset( $field['tag'] ) ? $field['tag'] : 'div';
		if ( isset( $field['close'] ) && true === $field['close'] ) {
			return '</' . $tag . '>';
		}

		return '<' . $tag . ' ' . $this->get_attribute_string( $field['attributes'] ) . '>';
	}

	/**
	 * Get repeater tools.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 *
	 * @return string
	 */
	protected function get_repeater_tools( $field ) {
		$confirm = isset( $field['confirm'] ) ? $field['confirm'] : __( 'Are you sure?', 'elementor-pro' );
		$remove_title = isset( $field['remove_title'] ) ? $field['remove_title'] : __( 'Delete', 'elementor-pro' );
		$toggle_title = isset( $field['toggle_title'] ) ? $field['toggle_title'] : __( 'Edit', 'elementor-pro' );
		$close_title = isset( $field['close_title'] ) ? $field['close_title'] : __( 'Close', 'elementor-pro' );

		return '<span class="elementor-repeater-tool-btn close-repeater-row" title="' . esc_attr( $close_title ) . '">
                    <i class="eicon-times" aria-hidden="true"></i>' . $close_title . '
                </span>
                <span class="elementor-repeater-tool-btn toggle-repeater-row" title="' . esc_attr( $toggle_title ) . '">
                    <i class="eicon-edit" aria-hidden="true"></i>' . $toggle_title . '
                </span>
                <span class="elementor-repeater-tool-btn remove-repeater-row" data-confirm="' . $confirm . '" title="' . esc_attr( $remove_title ) . '">
                    <i class="eicon-trash" aria-hidden="true"></i>' . $remove_title . '
                </span>';
	}

	/**
	 * Get field row.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $field
	 * @param string $field_html
	 *
	 * @return string
	 */
	protected function get_field_row( $field, $field_html ) {
		$description = '';
		$css_id = isset( $field['id'] ) ? ' ' . $field['id'] : '';

		if ( isset( $field['real_id'] ) ) {
			$css_id = ' ' . $field['real_id'];
		}

		$css_id .= ' elementor-field-' . $field['field_type'];

		return '<div class="elementor-field' . $css_id . '">' . $this->get_field_label( $field ) . $field_html . $description . '</div>';
	}

	/**
	 * Print metabox.
	 *
	 * @source modules/assets-manager/classes/assets-base
	 *
	 * @param array $fields
	 */
	protected function print_metabox( $fields ) {
		?>
		<div class="elementor-metabox-content">
			<?php
			foreach ( $fields as $field ) :
				$field['saved'] = isset( $field['saved'] ) ? $field['saved'] : '';
				echo $this->get_metabox_field_html( $field, $field['saved'] );
			endforeach;
			?>
		</div>
		<?php
	}

	/**
	 * Metabox_Base constructor.
	 */
	public function __construct() {
		$this->actions();
	}
}
