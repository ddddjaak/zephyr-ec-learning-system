import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium tracking-[0.3em] text-fd-muted-foreground">404</p>
      <h1 className="mt-3 text-2xl font-bold">页面不存在</h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-fd-muted-foreground">
        你访问的地址不存在或已被移动。本站文档全部位于
        <code className="mx-1 rounded bg-fd-muted px-1.5 py-0.5 text-xs text-fd-foreground">
          /zephyr-ec-learning-system/docs/
        </code>
        路径下——如果地址中缺少
        <code className="mx-1 rounded bg-fd-muted px-1.5 py-0.5 text-xs text-fd-foreground">
          zephyr-ec-learning-system
        </code>
        这一段，就会出现本页。
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          返回首页
        </Link>
        <Link
          href="/docs"
          className="rounded-lg border border-fd-border px-4 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
        >
          浏览文档
        </Link>
        <Link
          href="/docs/getting-started"
          className="rounded-lg border border-fd-border px-4 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
        >
          快速上手
        </Link>
      </div>
      <p className="mt-8 text-xs text-fd-muted-foreground">
        找不到想要的页面？按 <kbd className="rounded border border-fd-border px-1.5 py-0.5">Ctrl</kbd> +{' '}
        <kbd className="rounded border border-fd-border px-1.5 py-0.5">K</kbd> 打开搜索，或从上方导航进入。
      </p>
    </div>
  );
}
