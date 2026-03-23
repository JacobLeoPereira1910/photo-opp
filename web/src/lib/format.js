const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  return dateTimeFormatter.format(new Date(value))
}

export function formatRole(value) {
  if (value === 'admin') {
    return 'Administrador'
  }

  if (value === 'promoter') {
    return 'Promotor'
  }

  return value
}
