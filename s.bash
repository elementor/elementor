for file in tests/elements-regression/tests/**/*.jpeg; do ext="${file##*.}"; filename="${file%%-linux.*}"; mv "$file" "${filename}(editor)-linux.${ext}"; done
for file in tests/elements-regression/tests/**/*\(editor\).jpeg; do rm $file; done
