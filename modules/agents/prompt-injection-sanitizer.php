<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sanitizes auto-pulled text (excerpts, descriptions) before it is written into
 * either llms.txt or llms-full.txt.
 *
 * The goal is to keep the text readable by humans while neutralising patterns
 * that look like instructions aimed at an AI system, so the output stays
 * informative but not actionable as a prompt-injection vector.
 */
class Prompt_Injection_Sanitizer {

	/**
	 * Regex patterns that look like AI command/instruction markers.
	 * Each entry is [pattern, replacement].
	 *
	 * @var array<array{0: string, 1: string}>
	 */
	private const PATTERNS = [
		// Chat-ML / LLaMA-style role tags: <|system|>, <|user|>, <|assistant|>, <|im_start|>, etc.
		[ '/<\|[a-zA-Z0-9_\-]+\|>/i', '' ],

		// Alpaca / Vicuna instruction delimiters: ### Instruction, ### Input, ### Response
		[ '/^#{1,4}\s*(instruction|input|response|system|prompt|context)\b[:\s]*/im', '' ],

		// Common injection openers (case-insensitive, at word boundary)
		[
			'/\b(ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|commands?|context)|'
			. 'disregard\s+(all\s+)?(previous|prior)\s+(instructions?|prompts?)|'
			. 'forget\s+(all\s+)?(previous|prior)\s+(instructions?|context)|'
			. 'you\s+are\s+now\s+(a|an)\s+|'
			. 'act\s+as\s+(a|an)\s+|'
			. 'pretend\s+(you\s+are|to\s+be)\s+|'
			. 'your\s+new\s+(role|persona|instructions?)\s+(is|are)\b)/i',
			'[…]',
		],

		// OpenAI / Anthropic system-prefix markers: "System:", "Assistant:", "User:", "Human:"
		[ '/^(system|assistant|user|human)\s*:/im', '' ],

		// INST tags used in Llama-2 / Mistral: [INST] ... [/INST]
		[ '/\[\/?(INST|SYS|SYSTEM)\]/i', '' ],

		// XML-style instruction wrappers sometimes used in prompt engineering
		[ '/<\/?(instructions?|system|prompt|context|task)>/i', '' ],

		// Jailbreak-style: "DAN mode", "developer mode", "jailbreak"
		[ '/\b(DAN\s+mode|developer\s+mode\s+enabled|jailbreak\s+mode)\b/i', '[…]' ],
	];

	/**
	 * Sanitize a string of text that will be embedded in an llms.txt file.
	 *
	 * The text is passed through each pattern in sequence. Only the suspicious
	 * command-like fragments are removed or replaced; the surrounding readable
	 * content is preserved.
	 *
	 * @param string $text Raw excerpt or description.
	 * @return string Sanitized text safe to embed in the llms file.
	 */
	public function sanitize( string $text ): string {
		$text = wp_strip_all_tags( $text );

		foreach ( self::PATTERNS as [ $pattern, $replacement ] ) {
			$sanitized = preg_replace( $pattern, $replacement, $text );

			// preg_replace returns null on error; keep original if that happens.
			if ( null !== $sanitized ) {
				$text = $sanitized;
			}
		}

		// Collapse multiple consecutive blank lines or whitespace runs left by removal.
		$text = preg_replace( '/\n{3,}/', "\n\n", $text ) ?? $text;
		$text = preg_replace( '/[ \t]{2,}/', ' ', $text ) ?? $text;

		return trim( $text );
	}
}
