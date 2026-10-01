export function findDemoAccount(accounts, email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  return Object.values(accounts).find(account => account.email === normalizedEmail && account.password === password) ?? null
}

export function demoShortcutRole(event) {
  if (event.repeat || event.isComposing || !event.altKey || !event.shiftKey || !(event.metaKey || event.ctrlKey)) return null
  if (event.target?.closest?.('input, textarea, select, [contenteditable]')) return null
  if (event.code === 'KeyP') return 'player'
  if (event.code === 'KeyA') return 'admin'
  return null
}
