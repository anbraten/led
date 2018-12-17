DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

docker run -td \
  --name ledwall \
  --restart always \
  -p 8080:80 \
  -v $DIR/app:/app \
  ledwall
