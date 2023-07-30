# An image resizing proxy

This app uses the node module `sharp` to resize an image based on a url by:

1. Downloading the image using `node-fetch` as a buffer
1. Passing the image to `sharp`, and then resizing it
1. Passing the resized image buffer back to `express` to serve with png headers

## Usage
`https://image-url-proxy.glitch.me/proxy?url=`<em>`<your image url here>`</em>