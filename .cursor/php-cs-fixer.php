<?php

declare(strict_types = 1);

use PhpCsFixer\Config;
use PhpCsFixer\Finder;

$finder = Finder::create()->
    in( __DIR__ )->
    exclude( [
        'vendor',
        'vendor_prefixed',
        'tmp',
        'build',
        'node_modules',
        'includes/libraries',
        'assets/js/packages',
    ] );

// https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/tree/master/doc/rules
return ( new Config() )->
    setFinder( $finder )->
    setRiskyAllowed( true )->
    setRules( [
        '@PSR2' => true,
        '@PhpCsFixer' => true,
        'array_syntax' => true,

        // is it necessary?
        // 'array_push' => false,

        // is it necessary?
        // 'no_alias_functions' => [
        //     'sets' => [ '@all', '@exif', '@ftp', '@IMAP', '@internal', '@ldap', '@mbreg', '@mysqli', '@oci', '@odbc', '@openssl', '@pcntl', '@pg', '@posix', '@snmp', '@sodium', '@time' ],
        // ]
        'no_multiline_whitespace_around_double_arrow' => true,
        'no_whitespace_before_comma_in_array' => true,

        // is it necessary?
        // 'no_alias_language_construct_call' => true,

        // is it necessary?
        // 'normalize_index_brace' => true,

        // is it CORRECT?
        // 'trim_array_spaces' -> false,

        'whitespace_after_comma_in_array' => [
            'ensure_single_space' => true,
        ],
        'single_space_around_construct' => true,
        'braces_position' => [
            'control_structures_opening_brace' => 'same_line',
            'anonymous_functions_opening_brace' => 'same_line',
            'classes_opening_brace' => 'same_line',
            'allow_single_line_empty_anonymous_classes' => false,
            'allow_single_line_anonymous_functions' => false,
        ],
        'curly_braces_position' => [
            'functions_opening_brace' => 'same_line',
            'classes_opening_brace' => 'same_line',
        ],
        'statement_indentation' => [
            'stick_comment_to_next_continuous_control_statement' => true,
        ],
        'encoding' => true,
        'no_multiple_statements_per_line' => true,
        'no_trailing_comma_in_singleline' => true,
        'numeric_literal_separator' => [
            'override_existing' => true,
            'strategy' => 'no_separator',
        ],
        'single_line_empty_body' => true,
        'class_reference_name_casing' => true,
        'constant_case' => true,
        'integer_literal_case' => true,
        'lowercase_keywords' => true,
        'lowercase_static_reference' => true,
        'magic_constant_casing' => true,
        'magic_method_casing' => true,
        'native_function_casing' => true,
        'native_function_type_declaration_casing' => true,
        'native_type_declaration_casing' => true,
        'cast_spaces' => ['space' => 'single'],
        'lowercase_cast' => true,
        'modernize_types_casting' => true,
        'no_short_bool_cast' => false,
        'short_scalar_cast' => true,
        'class_attributes_separation' => ['elements' => [
            'const' => 'only_if_meta', 'method' => 'one', 'property' => 'only_if_meta', 'trait_import' => 'one', 'case' => 'one',
        ]],
        'class_definition' => [
            'inline_constructor_arguments' => true,
            'multi_line_extends_each_single_line' => false,
            'single_item_single_line' => false,
            'single_line' => true,
            'space_before_parenthesis' => false,
        ],
        'no_blank_lines_after_class_opening' => true,
        'no_null_property_initialization' => false,
        'no_php4_constructor' => true,

        // is it necessary?
        // 'ordered_class_elements' => 'https://github.com/PHP-CS-Fixer/PHP-CS-Fixer/blob/master/doc/rules/class_notation/ordered_class_elements.rst'

        // is it necessary?
        // 'protected_to_private' => true,

        'self_accessor' => true,
        'self_static_accessor' => true,
        'single_class_element_per_statement' => true,
        'single_trait_insert_per_statement' => true,
        'visibility_required' => [
            'elements' => ['method', 'property'],
        ],
        'multiline_comment_opening_closing' => true,
        'no_empty_comment' => true,
        'no_trailing_whitespace_in_comment' => true,
        'single_line_comment_spacing' => true,
        'control_structure_braces' => true,
        'control_structure_continuation_position' => [
            'position' => 'same_line',
        ],
        'elseif' => true,
        'empty_loop_body' => ['style' => 'braces'],
        'no_alternative_syntax' => false,
        'no_break_comment' => true,
        'no_superfluous_elseif' => false,
        'no_unneeded_braces' => true,
        'no_unneeded_control_parentheses' => true,
        'no_useless_else' => true,
        'simplified_if_return' => false,
        'switch_case_semicolon_to_colon' => true,
        'switch_case_space' => true,
        'switch_continue_to_break' => true,
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays'], // possible values: ['arguments', 'array_destructuring', 'arrays', 'match', 'parameters']
        ],
        'yoda_style' => true,
        'doctrine_annotation_array_assignment' => [
            'operator' => ':',
        ],
        'doctrine_annotation_braces' => true,
        'doctrine_annotation_indentation' => true,
        'doctrine_annotation_spaces' => [
            'before_array_assignments_colon' => false,
        ],
        'function_declaration' => [
            'closure_fn_spacing' => 'none',
            'closure_function_spacing' => 'none',
            'trailing_comma_single_line' => false,
        ],
        'type_declaration_spaces' => true,
        'lambda_not_used_import' => true, // could be opposite
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline', 'keep_multiple_spaces_after_comma' => false,
        ],
        'no_spaces_after_function_name' => true,
        'no_unreachable_default_argument_value' => true,
        'nullable_type_declaration_for_default_null_value' => true,
        'return_type_declaration' => [
            'space_before' => 'none',
        ],
        'declare_equal_normalize' => [
            'space' => 'single',
        ],
        'blank_line_after_namespace' => true,
        'blank_lines_before_namespace' => [
            'min_line_breaks' => 1,
            'max_line_breaks' => 2,
        ],
        'clean_namespace' => true,
        'no_leading_namespace_whitespace' => true,
        'assign_null_coalescing_to_coalesce_equal' => false, // could be opposite
        'binary_operator_spaces' => [
            'operators' => [
                '=' => 'single_space',
                '*' => 'single_space',
                '/' => 'single_space',
                '%' => 'single_space',
                '<' => 'single_space',
                '>' => 'single_space',
                '|' => 'single_space',
                '^' => 'single_space',
                '+' => 'single_space',
                '-' => 'single_space',
                '&' => 'single_space',
                '&=' => 'single_space',
                '&&' => 'single_space',
                '||' => 'single_space',
                '.=' => 'single_space',
                '/=' => 'single_space',
                '=>' => 'single_space',
                '==' => 'single_space',
                '>=' => 'single_space',
                '===' => 'single_space',
                '!=' => 'single_space',
                '<>' => 'single_space',
                '!==' => 'single_space',
                '<=' => 'single_space',
                'and' => 'single_space',
                'or' => 'single_space',
                'xor' => 'single_space',
                '-=' => 'single_space',
                '%=' => 'single_space',
                '*=' => 'single_space',
                '|=' => 'single_space',
                '+=' => 'single_space',
                '<<' => 'single_space',
                '<<=' => 'single_space',
                '>>' => 'single_space',
                '>>=' => 'single_space',
                '^=' => 'single_space',
                '**' => 'single_space',
                '**=' => 'single_space',
                '<=>' => 'single_space',
                '??' => 'single_space',
                '??=' => 'single_space',
            ],
        ],
        'concat_space' => [
            'spacing' => 'one',
        ],
        'logical_operators' => true,
        'no_space_around_double_colon' => true,
        'no_useless_concat_operator' => true,
        'not_operator_with_space' => true,
        'not_operator_with_successor_space' => false,
        'object_operator_without_whitespace' => true,
        'operator_linebreak' => [
            'only_booleans' => false,
            'position' => 'end',
        ],
        'standardize_not_equals' => true,
        'ternary_operator_spaces' => true,
        'ternary_to_elvis_operator' => false,
        'ternary_to_null_coalescing' => false, // could be opposite
        'unary_operator_spaces' => [
            'only_dec_inc' => true,
        ],
        'blank_line_after_opening_tag' => true,
        'echo_tag_syntax' => [
            'format' => 'long',
            'shorten_simple_statements_only' => false,
        ],
        'full_opening_tag' => true,
        'no_closing_tag' => true,
        'align_multiline_comment' => [
            'comment_type' => 'phpdocs_like', // could be phpdocs_only
        ],
        'no_blank_lines_after_phpdoc' => true,
        'no_empty_phpdoc' => true,
        'phpdoc_align' => [
            'align' => 'left',
        ],
        'phpdoc_annotation_without_dot' => true,
        'phpdoc_indent' => true,
        'phpdoc_return_self_reference' => [
            'replacements' => [
                'this' => 'self',
            ],
        ],
        'phpdoc_scalar' => true,
        'phpdoc_trim' => true,
        'phpdoc_trim_consecutive_blank_line_separation' => true,
        'phpdoc_types' => true,
        'phpdoc_var_annotation_correct_order' => true,
        'no_useless_return' => true,
        'return_assignment' => true,
        'multiline_whitespace_before_semicolons' => [
            'strategy' => 'no_multi_line',
        ],
        'no_empty_statement' => true,
        'no_singleline_whitespace_before_semicolons' => true,
        'semicolon_after_instruction' => true,
        'space_after_semicolon' => [
            'remove_in_empty_for_expressions' => true,
        ],
        'strict_comparison' => true,
        'strict_param' => true,
        'no_trailing_whitespace_in_string' => true, // could be opposite
        'single_quote' => true,
        'array_indentation' => true,
        'blank_line_before_statement' => [
            'statements' => ['break', 'case', 'continue', 'declare', 'default', 'do', 'exit', 'for', 'foreach', 'goto', 'if', 'include', 'include_once', 'phpdoc', 'require', 'require_once', 'return', 'switch', 'throw', 'try', 'while', 'yield', 'yield_from'],
        ],
        'indentation_type' => true,
        'method_chaining_indentation' => true,
        'no_extra_blank_lines' => true,
        // [
        //     'tokens' => ['attribute', 'break', 'case', 'comma', 'continue', 'curly_brace_block', 'default', 'extra', 'parenthesis_brace_block', 'return', 'square_brace_block', 'switch', 'throw', 'use', 'use_trait']
        // ],
        'no_spaces_around_offset' => [
            'positions' => ['outside'],
        ],
        'no_trailing_whitespace' => true,
        'no_whitespace_in_blank_line' => true,
        'single_blank_line_at_eof' => true,
        'spaces_inside_parentheses' => [
            'space' => 'single',
        ],
        'statement_indentation' => [
            'stick_comment_to_next_continuous_control_statement' => true,
        ],
        'types_spaces' => [
            'space' => 'single',
            'space_multiple_catch' => 'single',
        ],
    ] );
