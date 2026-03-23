export function toAuthenticatedUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt?.toISOString?.() || user.createdAt,
    updatedAt: user.updatedAt?.toISOString?.() || user.updatedAt
  };
}

export function toTokenPayload(user) {
  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export function toUserSummary(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}
