import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rica-plaza-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function errorMessage(error) {
  if (!error.response) {
    return 'Cannot reach the store API. Check that Laravel is running, then try again.'
  }

  const validationErrors = error.response?.data?.errors
  const firstValidationError = validationErrors
    ? Object.values(validationErrors).flat()[0]
    : null

  return firstValidationError || error.response?.data?.message || 'Something went wrong. Please try again.'
}

function Brand({ light = false }) {
  return (
    <div className={`flex items-center gap-3 ${light ? 'text-white' : 'text-[#17382d]'}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-black ${light ? 'bg-white/10 text-white' : 'bg-[#17382d] text-white'}`}>
        R
      </span>
      <span className="text-lg font-bold tracking-tight">rica plaza</span>
    </div>
  )
}

function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#263a32]">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1d2b25] outline-none transition placeholder:text-[#9ba69f] focus:border-[#52745f] focus:ring-4 focus:ring-[#52745f]/10 ${error ? 'border-rose-400' : 'border-[#dfe5df]'}`}
      />
      {error && <span className="mt-1.5 block text-xs text-rose-600">{error}</span>}
    </label>
  )
}

function AuthScreen({ onAuthenticated, initialError, onClearError }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(initialError || '')

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    onClearError()

    try {
      const { data } = await api.post(`/api/${mode === 'login' ? 'login' : 'register'}`, form)
      localStorage.setItem('rica-plaza-token', data.token)
      onAuthenticated(data.user)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setForm({ name: '', email: '', password: '', password_confirmation: '' })
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_90px_-40px_rgba(28,55,39,0.28)] lg:grid-cols-[1.03fr_0.97fr]">
        <section className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-[#17382d] p-8 text-white sm:p-12 lg:min-h-[700px] lg:p-14">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-[#c8d8ad]/10 blur-2xl" />
          <Brand light />

          <div className="relative z-10 mt-16 max-w-lg lg:mt-0">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#dbe8cc]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8d8ad]" />
              Your shop, in good hands
            </span>
            <h1 className="max-w-md text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
              Good things are worth selling.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-white/65">
              Keep your products organized, your stock in check, and your growing business moving forward.
            </p>
          </div>

          <div className="relative z-10 mt-12 flex items-center justify-between border-t border-white/15 pt-6 text-sm text-white/55">
            <span>Made for the next big thing.</span>
            <span>© Rica Plaza</span>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 py-12 sm:p-12 lg:p-14">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-[#6f806f]">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#1b3026]">
              {mode === 'login' ? 'Log in to your shop' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#77847a]">
              {mode === 'login'
                ? 'Enter your details to pick up where you left off.'
                : 'A few details and you’ll be ready to set up your store.'}
            </p>

            <div className="mt-8 grid grid-cols-2 rounded-xl bg-[#f3f5f0] p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-[#203b2f] shadow-sm' : 'text-[#748176] hover:text-[#203b2f]'}`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-[#203b2f] shadow-sm' : 'text-[#748176] hover:text-[#203b2f]'}`}
              >
                Create account
              </button>
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-5">
              {mode === 'register' && (
                <Field
                  label="Your name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jamie Parker"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              )}
              <Field
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
              <Field
                label="Password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              {mode === 'register' && (
                <Field
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  value={form.password_confirmation}
                  onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
                  required
                />
              )}
              <button
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#244b38] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#244b38]/15 transition hover:bg-[#193c2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Please wait…' : mode === 'login' ? 'Log in to your shop' : 'Create your account'}
                {!busy && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-[#8b958d]">
              By continuing, you agree to keep your shop details safe and up to date.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function ProductDialog({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock ?? 0,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSave({ ...form, price: Number(form.price), stock: Number(form.stock) })
      onClose()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102219]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#829080]">{product ? 'Update your catalog' : 'Add to your catalog'}</p>
            <h2 id="product-dialog-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#1b3026]">{product ? 'Edit product' : 'New product'}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid h-9 w-9 place-items-center rounded-lg text-xl text-[#748176] hover:bg-[#f3f5f0]">×</button>
        </div>

        {error && <div role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Product name" placeholder="e.g. Everyday Tote" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={255} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#263a32]">Description</span>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-[#dfe5df] bg-white px-4 py-3 text-sm text-[#1d2b25] outline-none transition placeholder:text-[#9ba69f] focus:border-[#52745f] focus:ring-4 focus:ring-[#52745f]/10"
              placeholder="A few details about this product"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            <Field label="Available stock" type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-[#dfe5df] px-5 py-3 text-sm font-semibold text-[#506056] hover:bg-[#f7f8f5]">Cancel</button>
            <button disabled={busy} className="rounded-xl bg-[#244b38] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193c2b] disabled:opacity-60">{busy ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function Dashboard({ user, products, onCreate, onEdit, onDelete, onLogout, pageError, notice, onClearNotice }) {
  const [query, setQuery] = useState('')
  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return products
    return products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(value))
  }, [products, query])

  const totalUnits = products.reduce((total, product) => total + Number(product.stock), 0)
  const lowStock = products.filter((product) => Number(product.stock) < 5).length
  const inventoryValue = products.reduce((total, product) => total + Number(product.price) * Number(product.stock), 0)
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#1b3026]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#e8ebe4] bg-white px-5 py-7 lg:flex">
        <Brand />
        <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a1aaa0]">Workspace</p>
        <div className="flex items-center gap-3 rounded-xl bg-[#eef3ed] px-3 py-3 text-sm font-semibold text-[#244b38]">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white">▦</span>
          Product inventory
        </div>
        <div className="mt-auto rounded-2xl bg-[#f5f7f2] p-4">
          <p className="text-xs font-semibold text-[#6e7c70]">YOUR STORE</p>
          <p className="mt-2 truncate text-sm font-bold">{user.name}</p>
          <p className="mt-0.5 truncate text-xs text-[#89948a]">{user.email}</p>
          <button onClick={onLogout} className="mt-4 text-xs font-semibold text-[#617267] hover:text-rose-600">Sign out →</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-[#e8ebe4] bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="lg:hidden"><Brand /></div>
            <div className="hidden text-sm text-[#7a877c] lg:block">Store management <span className="px-2 text-[#c3cac0]">/</span> Inventory</div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[#748176] sm:block">Good to see you, <span className="font-semibold text-[#263a32]">{user.name.split(' ')[0]}</span></span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dfe9d8] text-sm font-bold text-[#244b38]">{user.name.charAt(0).toUpperCase()}</span>
              <button onClick={onLogout} className="text-xs font-semibold text-[#617267] hover:text-rose-600 lg:hidden">Sign out</button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#849184]">Your overview</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Product inventory</h1>
              <p className="mt-2 text-sm text-[#7d897e]">A clear view of what you’re selling and what’s in stock.</p>
            </div>
            <button onClick={onCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#244b38] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#244b38]/10 transition hover:bg-[#193c2b]">
              <span className="text-lg leading-none">+</span> Add product
            </button>
          </div>

          {notice && (
            <div role="status" className="mt-6 flex items-center justify-between rounded-xl border border-[#d7e7d5] bg-[#eff7ed] px-4 py-3 text-sm text-[#315d3c]">
              {notice}
              <button onClick={onClearNotice} aria-label="Dismiss notification" className="ml-4 text-lg leading-none">×</button>
            </div>
          )}
          {pageError && <div role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{pageError}</div>}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Products listed', value: products.length, note: 'In your catalog', icon: '▤' },
              { label: 'Units in stock', value: totalUnits, note: 'Across all products', icon: '□' },
              { label: 'Low stock', value: lowStock, note: 'Fewer than 5 units', icon: '!' },
              { label: 'Stock value', value: currency.format(inventoryValue), note: 'Based on current prices', icon: '$' },
            ].map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-[#e9ece5] bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#7b877d]">{stat.label}</p>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1f5ee] text-sm font-bold text-[#52745f]">{stat.icon}</span>
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-[#21392c]">{stat.value}</p>
                <p className="mt-1 text-xs text-[#9aa39a]">{stat.note}</p>
              </article>
            ))}
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-[#e9ece5] bg-white">
            <div className="flex flex-col gap-4 border-b border-[#edf0e9] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="font-semibold text-[#243a2d]">Your products</h2>
                <p className="mt-1 text-xs text-[#8b968c]">{products.length} {products.length === 1 ? 'item' : 'items'} in your catalog</p>
              </div>
              <label className="relative block sm:w-72">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa59a]">⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products…" className="w-full rounded-xl border border-[#e5e9e1] bg-[#fbfcfa] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-[#a0aaa0] focus:border-[#91a68f] focus:ring-4 focus:ring-[#91a68f]/10" />
              </label>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-[#fafbf9] text-[10px] font-bold uppercase tracking-[0.13em] text-[#929d93]">
                    <tr>
                      <th className="px-6 py-3.5">Product</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Stock</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f2ed]">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="transition hover:bg-[#fbfcfa]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef3e9] text-sm font-bold text-[#52745f]">{product.name.charAt(0).toUpperCase()}</span>
                            <div className="max-w-xs">
                              <p className="truncate text-sm font-semibold text-[#2b3c31]">{product.name}</p>
                              <p className="mt-1 truncate text-xs text-[#929b92]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-[#526056]">{currency.format(Number(product.price))}</td>
                        <td className="px-4 py-4 text-sm text-[#526056]">{product.stock} units</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${Number(product.stock) === 0 ? 'bg-rose-50 text-rose-600' : Number(product.stock) < 5 ? 'bg-amber-50 text-amber-700' : 'bg-[#edf6ec] text-[#4f7a52]'}`}>
                            {Number(product.stock) === 0 ? 'Out of stock' : Number(product.stock) < 5 ? 'Low stock' : 'In stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onEdit(product)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#56715c] hover:bg-[#eef3e9]">Edit</button>
                            <button onClick={() => onDelete(product)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#a07470] hover:bg-rose-50">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f0f4ec] text-2xl text-[#52745f]">▤</span>
                <h3 className="mt-4 font-semibold text-[#324538]">{query ? 'No matching products' : 'Your catalog is ready for its first product'}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8a968c]">
                  {query ? 'Try another search or clear the field to see your products.' : 'Add products to keep your inventory and stock levels organized in one place.'}
                </p>
                {!query && <button onClick={onCreate} className="mt-5 rounded-xl bg-[#244b38] px-5 py-3 text-sm font-semibold text-white hover:bg-[#193c2b]">Add your first product</button>}
              </div>
            )}
          </section>

          <p className="mt-6 text-center text-xs text-[#a1aaa0]">Your store data is private to your account.</p>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [checkingSession, setCheckingSession] = useState(() => Boolean(localStorage.getItem('rica-plaza-token')))
  const [activeProduct, setActiveProduct] = useState(undefined)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')

  const loadProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/api/products')
      setProducts(data)
      setPageError('')
    } catch (error) {
      setPageError(errorMessage(error))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem('rica-plaza-token')

    if (!token) {
      return () => { cancelled = true }
    }

    api.get('/api/me')
      .then(({ data }) => {
        if (cancelled) return
        setUser(data)
        void loadProducts()
      })
      .catch(() => {
        localStorage.removeItem('rica-plaza-token')
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false)
      })

    return () => { cancelled = true }
  }, [loadProducts])

  const createProduct = async (form) => {
    await api.post('/api/products', form)
    await loadProducts()
    setNotice('Product added to your inventory.')
  }

  const updateProduct = async (form) => {
    await api.put(`/api/products/${activeProduct.id}`, form)
    await loadProducts()
    setNotice('Product details updated.')
  }

  const saveProduct = async (form) => activeProduct ? updateProduct(form) : createProduct(form)

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}" from your inventory?`)) return
    setPageError('')
    try {
      await api.delete(`/api/products/${product.id}`)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setNotice('Product deleted from your inventory.')
    } catch (error) {
      setPageError(errorMessage(error))
    }
  }

  const logout = async () => {
    let logoutError = ''
    try {
      await api.post('/api/logout')
    } catch (error) {
      logoutError = `Your session could not be revoked on the server: ${errorMessage(error)}`
    }
    localStorage.removeItem('rica-plaza-token')
    setUser(null)
    setProducts([])
    setActiveProduct(undefined)
    setPageError('')
    setNotice('')
    if (logoutError) setNotice(logoutError)
  }

  const authenticate = (authenticatedUser) => {
    setUser(authenticatedUser)
    setPageError('')
    setNotice('')
    void loadProducts()
  }

  if (checkingSession) {
    return <div className="grid min-h-screen place-items-center bg-[#f6f7f2] text-sm font-medium text-[#718073]">Opening your shop…</div>
  }

  if (!user) {
    return <AuthScreen onAuthenticated={authenticate} initialError={notice} onClearError={() => setNotice('')} />
  }

  return (
    <>
      <Dashboard
        user={user}
        products={products}
        onCreate={() => setActiveProduct(null)}
        onEdit={(product) => setActiveProduct(product)}
        onDelete={deleteProduct}
        onLogout={logout}
        pageError={pageError}
        notice={notice}
        onClearNotice={() => setNotice('')}
      />
      {activeProduct !== undefined && (
        <ProductDialog
          product={activeProduct}
          onClose={() => setActiveProduct(undefined)}
          onSave={saveProduct}
        />
      )}
    </>
  )
}
