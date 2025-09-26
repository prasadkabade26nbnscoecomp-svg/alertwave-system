export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  teamId: string;
}

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};