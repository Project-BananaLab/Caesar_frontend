// 사용자 권한 정의
export const USER_ROLES = {
  ADMIN: 0,
  USER: 1
}

// 관리자 사용자 목록 (하드코딩)
export const ADMIN_USERS = ['admin', 'caesar']

// 사용자 권한 매핑
export const getUserRole = (username) => {
  return ADMIN_USERS.includes(username) ? USER_ROLES.ADMIN : USER_ROLES.USER
}

// 관리자 권한 체크
export const isAdmin = (user) => {
  if (!user) return false
  return getUserRole(user.username) === USER_ROLES.ADMIN
}
