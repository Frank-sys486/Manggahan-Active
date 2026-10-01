export function slotKey(date, facilityId, time) {
  return `${date}|${facilityId}|${time}`
}

export function isBookableStatus(status) {
  return status === 'open' || status === 'limited'
}

export function getSlotStatus(facility, date, time, times, reservations, blockedSlots) {
  const matchesSlot = reservation => reservation.date === date && reservation.facilityId === facility.id && reservation.time === time
  if (reservations.some(reservation => matchesSlot(reservation) && reservation.status !== 'Cancelled')) return 'booked'
  if (blockedSlots.includes(slotKey(date, facility.id, time))) return 'closed'

  const baseStatus = facility.statuses[times.indexOf(time)] ?? 'open'
  if (baseStatus === 'booked' && reservations.some(reservation => matchesSlot(reservation) && reservation.source === 'staff' && reservation.status === 'Cancelled')) return 'open'
  return baseStatus
}
