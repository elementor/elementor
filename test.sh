
           tags=$(git ls-remote --tags | grep "refs/tags/v[0-9]\+\.[0-9]\+\.[0-9]\+$")
        

        git fetch --tags
        
        # Loop through the list of tags and get their creation date
        latest_date=""
        latest_tag=""
        for tag in $tags; do
        echo "tag=${tag}"
          date=$(git log -1 --pretty=format:"%ai" $tag)
          if [ -z "$latest_date" ] || [ "$date" \> "$latest_date" ]; then
            latest_date="$date"
            latest_tag="$tag"
          fi
        done

        echo "latest_tag=${latest_tag}"
        # Output the latest tag's name
        PREVIOUS_TAG_NAME=$(echo "$latest_tag" | awk -F "/" '{print $3}')
        echo "PREVIOUS_TAG_NAME=${PREVIOUS_TAG_NAME}"
