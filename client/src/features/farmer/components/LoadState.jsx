/** Loading skeleton and error box shared by farmer and buyer screens. */
export function LoadingBlock() {
  return (
    <div role="status" aria-label="Loading" className="grid gap-3 px-5.5 pt-8 lg:px-0">
      <span className="h-8 w-2/3 animate-pulse bg-husk" />
      <span className="h-40 animate-pulse bg-husk" />
      <span className="h-16 animate-pulse bg-husk" />
    </div>
  )
}

export function ErrorBlock({ error, onRetry }) {
  return (
    <div role="alert" className="mt-8 border-l-[3px] border-danger bg-[#f4dfd6] px-4 py-3.5">
      <p className="font-semibold text-[#6e1f12]">Couldn’t load this screen</p>
      <p className="mt-1 text-sm text-stone-dark">{error?.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="label mt-3 min-h-11 text-forest underline underline-offset-4">
          Try again
        </button>
      )}
    </div>
  )
}
