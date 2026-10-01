import assert from 'node:assert/strict'
import test from 'node:test'
import { getSlotStatus, isBookableStatus, slotKey } from './bookingOperations.js'

const facility = { id: 'basketball', statuses: ['open', 'booked'] }
const times = ['4:00 PM', '5:00 PM']
const date = 'Monday, September 28, 2026'
const reservation = { id: 'MA-2041', date, facilityId: 'basketball', time: '5:00 PM', status: 'Confirmed', source: 'staff' }

test('admin blocks affect open slots but do not override reservations', () => {
  const block = slotKey(date, facility.id, '4:00 PM')
  assert.equal(getSlotStatus(facility, date, '4:00 PM', times, [], [block]), 'closed')
  assert.equal(getSlotStatus(facility, date, '5:00 PM', times, [reservation], [slotKey(date, facility.id, '5:00 PM')]), 'booked')
  assert.equal(isBookableStatus('closed'), false)
  assert.equal(isBookableStatus('limited'), true)
})

test('cancelling a seeded booking reopens its slot unless another booking uses it', () => {
  const cancelled = { ...reservation, status: 'Cancelled' }
  assert.equal(getSlotStatus(facility, date, '5:00 PM', times, [cancelled], []), 'open')
  assert.equal(getSlotStatus(facility, date, '5:00 PM', times, [cancelled, { ...reservation, id: 'MA-2044', source: 'player' }], []), 'booked')
})
