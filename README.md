# Martin Motion Portfolio

Static portfolio for Martin Motion.

## Media

Project thumbnails are optimized local WebP assets. Full project videos are served from the private Cloudflare R2 bucket `martin-motion-media` through the `martin-motion-media` Worker. The bucket itself is not public; only the routes listed in `workers/media-worker.mjs` are exposed.

## Checks

```sh
npm run check
```
