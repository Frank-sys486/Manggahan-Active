import assert from 'node:assert/strict'
import test from 'node:test'
import { demoShortcutRole, findDemoAccount } from './login.js'

const accounts = {
  player: { email: 'player@example.test', password: 'Player123' },
  admin: { email: 'admin@example.test', password: 'Admin123' },
}

test('matches the account from email and password without a role selection', () => {
  assert.equal(findDemoAccount(accounts, ' ADMIN@example.test ', 'Admin123'), accounts.admin)
  assert.equal(findDemoAccount(accounts, 'player@example.test', 'Player123'), accounts.player)
  assert.equal(findDemoAccount(accounts, 'admin@example.test', 'wrong'), null)
})

test('supports Mac and Windows shortcuts without firing while typing', () => {
  const shortcut = { altKey: true, shiftKey: true, repeat: false, isComposing: false, target: null }
  assert.equal(demoShortcutRole({ ...shortcut, metaKey: true, code: 'KeyP' }), 'player')
  assert.equal(demoShortcutRole({ ...shortcut, ctrlKey: true, code: 'KeyA' }), 'admin')
  assert.equal(demoShortcutRole({ ...shortcut, metaKey: true, code: 'KeyA', target: { closest: () => ({}) } }), null)
  assert.equal(demoShortcutRole({ ...shortcut, metaKey: true, code: 'KeyP', repeat: true }), null)
})
