reports_dir="./.lighthouseci"

# Loop through each JSON file that starts with "ihr" and ends with ".json"
for file in "$reports_dir"/lhr*.json; do
  if [[ -f "$file" ]]; then
    echo "Reading file: $file"
    cat "$file"
  else
    echo "No matching files found in $reports_dir"
  fi
done
