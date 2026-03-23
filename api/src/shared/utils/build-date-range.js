import { DateTime } from 'luxon';
import { BadRequestError } from '../../errors/app-error.js';

function buildDateTime(dateValue, timeValue, timezone) {
  const dateTime = DateTime.fromFormat(`${dateValue} ${timeValue}`, 'yyyy-MM-dd HH:mm', {
    zone: timezone
  });

  if (!dateTime.isValid) {
    throw new BadRequestError('Filtro de data/hora invalido');
  }

  return dateTime;
}

export function buildDateRange(filters = {}, timezone = 'UTC') {
  const { startDate, endDate, startTime, endTime } = filters;

  if (!startDate && !endDate && !startTime && !endTime) {
    return undefined;
  }

  const effectiveStartDate = startDate || endDate;
  const effectiveEndDate = endDate || startDate;
  const effectiveStartTime = startTime || '00:00';
  const effectiveEndTime = endTime || '23:59';

  const start = buildDateTime(effectiveStartDate, effectiveStartTime, timezone);
  const end = buildDateTime(effectiveEndDate, effectiveEndTime, timezone);

  if (start > end) {
    throw new BadRequestError('A data inicial nao pode ser maior que a data final');
  }

  return {
    gte: start.toUTC().toJSDate(),
    lte: end.toUTC().toJSDate()
  };
}
