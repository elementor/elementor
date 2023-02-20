CURRENT_CHANNEL_VERSION=$(git ls-remote --tags | grep -v "\-rc" | grep "cloud" | grep "3.11.1" | tail -n1 | awk -F'cloud' '{print $2}')

echo $CURRENT_CHANNEL_VERSION
echo "asdfasd"