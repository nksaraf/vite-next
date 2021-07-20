<p align="center">
  <img src="/logo.svg" width="320" /><h1  align="center"><code margin="0">vext</code></h1><p align="center"><i>Full stack, cross-platform React framework built on <code>vite</code></i></p>
</p>

NextJS alternative built on top of Vite, React Router, React Query

* File-system based routing (similar to Next JS)

```
  /api
    /notify.tsx
  /app
    /pages
      /_layout.tsx
      /index.tsx
      /post
        /[post].tsx
      /user
        /[id]
          /posts.tsx
          /index.tsx
      /users.tsx
      /admin
        /_layout.tsx
        /[...page].tsx
      /_document.tsx
  /db
    /index.tsx
```

```typescript



```
* SSR (with Suspense support)
* Prerendering and SSG
