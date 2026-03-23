export function maskIp(ipAddress) {
  if (!ipAddress) {
    return null;
  }

  if (ipAddress.includes('.')) {
    const chunks = ipAddress.split('.');

    if (chunks.length === 4) {
      return `${chunks[0]}.${chunks[1]}.x.x`;
    }
  }

  if (ipAddress.includes(':')) {
    const chunks = ipAddress.split(':').filter(Boolean);
    const preserved = chunks.slice(0, 3);
    return [...preserved, 'xxxx', 'xxxx'].join(':');
  }

  return ipAddress;
}
