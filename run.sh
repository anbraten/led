DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
docker run -td \
	--name ledwall \
	--restart always \
	--network ju60_bridge \
	-v $DIR/app:/app \
	ledwall
