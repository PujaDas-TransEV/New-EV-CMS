// // src/context/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from 'react-router-dom';

// // API Configuration
// const API_CONFIG = {
//   REFRESH_TOKEN_API: {
//     BASE_URL: 'https://dev-evcmsnew.transev.site/api/v1/auth/refresh'
//   }
// };

// // Token Manager Class
// class TokenManager {
//   static TOKEN_KEY = 'token';
//   static REFRESH_TOKEN_KEY = 'refresh_token';
//   static TOKEN_EXPIRY_KEY = 'token_expiry';
//   static REFRESH_IN_PROGRESS = false;
//   static REFRESH_QUEUE = [];
//   static listeners = [];
//   static isRefreshing = false;

//   static getAccessToken() {
//     return localStorage.getItem(this.TOKEN_KEY);
//   }

//   static getRefreshToken() {
//     return localStorage.getItem(this.REFRESH_TOKEN_KEY);
//   }

//   static getTokenExpiry() {
//     return localStorage.getItem(this.TOKEN_EXPIRY_KEY);
//   }

//   static saveTokens(accessToken, refreshToken, expiresIn) {
//     localStorage.setItem(this.TOKEN_KEY, accessToken);
//     if (refreshToken) {
//       localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
//     }
//     if (expiresIn) {
//       const expiryTime = Date.now() + (expiresIn * 1000);
//       localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
//     }
//     // Notify listeners
//     this.notifyListeners();
//   }

//   static clearTokens() {
//     localStorage.removeItem(this.TOKEN_KEY);
//     localStorage.removeItem(this.REFRESH_TOKEN_KEY);
//     localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
//     localStorage.removeItem('userInfo');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('cpoId');
//     // Notify listeners
//     this.notifyListeners();
//   }

//   static isTokenExpired() {
//     const expiry = this.getTokenExpiry();
//     if (!expiry) return true;
//     const expiryTime = parseInt(expiry);
//     const currentTime = Date.now();
//     const timeUntilExpiry = expiryTime - currentTime;
//     // 60 seconds buffer - token will be refreshed 60 seconds before expiry
//     return timeUntilExpiry < 60000;
//   }

//   static addListener(callback) {
//     this.listeners.push(callback);
//   }

//   static removeListener(callback) {
//     this.listeners = this.listeners.filter(listener => listener !== callback);
//   }

//   static notifyListeners() {
//     this.listeners.forEach(callback => callback());
//   }

//   static async refreshToken() {
//     // If refresh is already in progress, wait for it
//     if (this.REFRESH_IN_PROGRESS) {
//       return new Promise((resolve, reject) => {
//         this.REFRESH_QUEUE.push({ resolve, reject });
//       });
//     }

//     this.REFRESH_IN_PROGRESS = true;
//     this.isRefreshing = true;
//     const refreshToken = this.getRefreshToken();

//     if (!refreshToken) {
//       this.REFRESH_IN_PROGRESS = false;
//       this.isRefreshing = false;
//       this.handleQueue(false);
//       throw new Error('No refresh token available');
//     }

//     try {
//       console.log('🔄 Refreshing token...');
//       const response = await fetch(API_CONFIG.REFRESH_TOKEN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ refresh_token: refreshToken }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const { access_token, refresh_token, access_token_expires_at } = data;
        
//         // Calculate expires_in from expires_at
//         let expiresIn = null;
//         if (access_token_expires_at) {
//           const expiryDate = new Date(access_token_expires_at);
//           const now = new Date();
//           expiresIn = Math.floor((expiryDate - now) / 1000);
//         }
        
//         // Save new tokens
//         this.saveTokens(access_token, refresh_token, expiresIn);
        
//         // Update user info
//         try {
//           const decodedToken = jwtDecode(access_token);
//           const userEmail = localStorage.getItem('userEmail');
//           const cpoId = localStorage.getItem('cpoId');
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || userEmail || '',
//             scope: 'CPO',
//             cpoId: cpoId || '',
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding refreshed token:', decodeError);
//         }

//         console.log('✅ Token refreshed successfully');
//         this.REFRESH_IN_PROGRESS = false;
//         this.isRefreshing = false;
//         this.handleQueue(true, access_token);
//         this.notifyListeners();
//         return access_token;
//       } else {
//         // Refresh token failed - clear tokens and logout
//         console.error('❌ Refresh token failed:', data);
//         this.clearTokens();
//         this.REFRESH_IN_PROGRESS = false;
//         this.isRefreshing = false;
//         this.handleQueue(false);
//         // Dispatch event for session expired
//         window.dispatchEvent(new CustomEvent('session_expired', { detail: { message: data.message || 'Session expired' } }));
//         throw new Error('Session expired. Please login again.');
//       }
//     } catch (error) {
//       console.error('❌ Refresh token error:', error);
//       this.clearTokens();
//       this.REFRESH_IN_PROGRESS = false;
//       this.isRefreshing = false;
//       this.handleQueue(false);
//       window.dispatchEvent(new CustomEvent('session_expired', { detail: { message: error.message } }));
//       throw error;
//     }
//   }

//   static handleQueue(success, token) {
//     while (this.REFRESH_QUEUE.length > 0) {
//       const { resolve, reject } = this.REFRESH_QUEUE.shift();
//       if (success && token) {
//         resolve(token);
//       } else {
//         reject(new Error('Session expired. Please login again.'));
//       }
//     }
//   }

//   static async authenticatedRequest(url, options = {}) {
//     let accessToken = this.getAccessToken();

//     // Check if token exists and is not expired
//     if (accessToken && this.isTokenExpired()) {
//       try {
//         accessToken = await this.refreshToken();
//       } catch (error) {
//         throw error;
//       }
//     }

//     if (!accessToken) {
//       throw new Error('No access token available');
//     }

//     // Make the request
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...options.headers,
//         'Authorization': `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     // If we get a 401, try refreshing once more
//     if (response.status === 401) {
//       try {
//         accessToken = await this.refreshToken();
//         // Retry the request with new token
//         const retryResponse = await fetch(url, {
//           ...options,
//           headers: {
//             ...options.headers,
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//         });
//         return retryResponse;
//       } catch (error) {
//         throw error;
//       }
//     }

//     return response;
//   }
// }

// // Auth Context
// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const navigate = useNavigate();
//   const refreshIntervalRef = useRef(null);
//   const tokenCheckIntervalRef = useRef(null);
//   const isMounted = useRef(true);

//   // Check authentication status
//   const checkAuth = () => {
//     if (!isMounted.current) return false;
    
//     const token = TokenManager.getAccessToken();
//     const userInfo = localStorage.getItem('userInfo');
//     const refreshToken = TokenManager.getRefreshToken();
    
//     if (token && refreshToken && !TokenManager.isTokenExpired()) {
//       setIsAuthenticated(true);
//       if (userInfo) {
//         try {
//           setUser(JSON.parse(userInfo));
//         } catch (e) {
//           setUser(null);
//         }
//       }
//       return true;
//     } else if (token && refreshToken && TokenManager.isTokenExpired()) {
//       // Token expired, try to refresh silently
//       TokenManager.refreshToken()
//         .then(() => {
//           if (isMounted.current) {
//             setIsAuthenticated(true);
//             const userInfo = localStorage.getItem('userInfo');
//             if (userInfo) {
//               try {
//                 setUser(JSON.parse(userInfo));
//               } catch (e) {
//                 setUser(null);
//               }
//             }
//           }
//         })
//         .catch(() => {
//           if (isMounted.current) {
//             setIsAuthenticated(false);
//             setUser(null);
//             if (window.location.pathname !== '/signin') {
//               navigate('/signin', { replace: true });
//             }
//           }
//         });
//       return false;
//     } else {
//       setIsAuthenticated(false);
//       setUser(null);
//       return false;
//     }
//   };

//   // Listen for token changes
//   useEffect(() => {
//     const handleTokenChange = () => {
//       if (isMounted.current) {
//         checkAuth();
//       }
//     };

//     TokenManager.addListener(handleTokenChange);

//     return () => {
//       TokenManager.removeListener(handleTokenChange);
//     };
//   }, []);

//   // Listen for session expired event
//   useEffect(() => {
//     const handleSessionExpired = (event) => {
//       if (isMounted.current) {
//         setIsAuthenticated(false);
//         setUser(null);
//         // Only navigate if not already on signin page
//         if (window.location.pathname !== '/signin') {
//           navigate('/signin', { replace: true });
//         }
//       }
//     };

//     window.addEventListener('session_expired', handleSessionExpired);

//     return () => {
//       window.removeEventListener('session_expired', handleSessionExpired);
//     };
//   }, [navigate]);

//   // Initial auth check
//   useEffect(() => {
//     isMounted.current = true;
//     checkAuth();
//     setLoading(false);

//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   // Setup auto-refresh interval
//   useEffect(() => {
//     // Check token status every 15 seconds
//     refreshIntervalRef.current = setInterval(() => {
//       if (!isMounted.current) return;
      
//       const token = TokenManager.getAccessToken();
//       const refreshToken = TokenManager.getRefreshToken();
      
//       if (token && refreshToken && TokenManager.isTokenExpired()) {
//         setIsRefreshing(true);
//         TokenManager.refreshToken()
//           .then(() => {
//             if (isMounted.current) {
//               setIsRefreshing(false);
//               setIsAuthenticated(true);
//               const userInfo = localStorage.getItem('userInfo');
//               if (userInfo) {
//                 try {
//                   setUser(JSON.parse(userInfo));
//                 } catch (e) {
//                   setUser(null);
//                 }
//               }
//             }
//           })
//           .catch(() => {
//             if (isMounted.current) {
//               setIsRefreshing(false);
//               setIsAuthenticated(false);
//               setUser(null);
//               if (window.location.pathname !== '/signin') {
//                 navigate('/signin', { replace: true });
//               }
//             }
//           });
//       }
//     }, 15000);

//     // Check token validity every 30 seconds
//     tokenCheckIntervalRef.current = setInterval(() => {
//       if (!isMounted.current) return;
      
//       const token = TokenManager.getAccessToken();
//       const refreshToken = TokenManager.getRefreshToken();
      
//       if (token && refreshToken && TokenManager.isTokenExpired()) {
//         setIsAuthenticated(false);
//         setUser(null);
//         if (window.location.pathname !== '/signin') {
//           navigate('/signin', { replace: true });
//         }
//       }
//     }, 30000);

//     return () => {
//       if (refreshIntervalRef.current) {
//         clearInterval(refreshIntervalRef.current);
//       }
//       if (tokenCheckIntervalRef.current) {
//         clearInterval(tokenCheckIntervalRef.current);
//       }
//     };
//   }, [navigate]);

//   // Login function
//   const login = (accessToken, refreshToken, expiresIn, userInfo) => {
//     TokenManager.saveTokens(accessToken, refreshToken, expiresIn);
//     if (userInfo) {
//       localStorage.setItem('userInfo', JSON.stringify(userInfo));
//       setUser(userInfo);
//     }
//     setIsAuthenticated(true);
//   };

//   // Logout function
//   const logout = () => {
//     TokenManager.clearTokens();
//     setIsAuthenticated(false);
//     setUser(null);
//     navigate('/signin', { replace: true });
//   };

//   // Refresh token function
//   const refreshToken = async () => {
//     try {
//       const token = await TokenManager.refreshToken();
//       return token;
//     } catch (error) {
//       logout();
//       throw error;
//     }
//   };

//   // Authenticated request function
//   const authenticatedRequest = async (url, options = {}) => {
//     try {
//       return await TokenManager.authenticatedRequest(url, options);
//     } catch (error) {
//       if (error.message === 'Session expired. Please login again.') {
//         logout();
//       }
//       throw error;
//     }
//   };

//   const value = {
//     isAuthenticated,
//     loading,
//     user,
//     isRefreshing,
//     login,
//     logout,
//     refreshToken,
//     authenticatedRequest,
//     getAccessToken: TokenManager.getAccessToken.bind(TokenManager),
//     getRefreshToken: TokenManager.getRefreshToken.bind(TokenManager),
//     isTokenExpired: TokenManager.isTokenExpired.bind(TokenManager),
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export { TokenManager };

// src/context/AuthContext.jsx
// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from 'react-router-dom';

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';
// const CPO_APP_ID = process.env.REACT_APP_CPO_APP_ID || 'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   REFRESH_TOKEN_API: {
//     BASE_URL: `${API_BASE_URL}/api/v1/auth/refresh`
//   }
// };

// // Token Manager Class
// class TokenManager {
//   static TOKEN_KEY = 'token';
//   static REFRESH_TOKEN_KEY = 'refresh_token';
//   static TOKEN_EXPIRY_KEY = 'token_expiry';
//   static REFRESH_IN_PROGRESS = false;
//   static REFRESH_QUEUE = [];
//   static listeners = [];
//   static isRefreshing = false;

//   static getAccessToken() {
//     return localStorage.getItem(this.TOKEN_KEY);
//   }

//   static getRefreshToken() {
//     return localStorage.getItem(this.REFRESH_TOKEN_KEY);
//   }

//   static getTokenExpiry() {
//     return localStorage.getItem(this.TOKEN_EXPIRY_KEY);
//   }

//   static saveTokens(accessToken, refreshToken, expiresIn) {
//     localStorage.setItem(this.TOKEN_KEY, accessToken);
//     if (refreshToken) {
//       localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
//     }
//     if (expiresIn) {
//       const expiryTime = Date.now() + (expiresIn * 1000);
//       localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
//     }
//     this.notifyListeners();
//   }

//   static clearTokens() {
//     localStorage.removeItem(this.TOKEN_KEY);
//     localStorage.removeItem(this.REFRESH_TOKEN_KEY);
//     localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
//     localStorage.removeItem('userInfo');
//     localStorage.removeItem('userEmail');
//     localStorage.removeItem('cpoId');
//     this.notifyListeners();
//   }

//   static isTokenExpired() {
//     const expiry = this.getTokenExpiry();
//     if (!expiry) return true;
//     const expiryTime = parseInt(expiry);
//     const currentTime = Date.now();
//     const timeUntilExpiry = expiryTime - currentTime;
//     return timeUntilExpiry < 60000;
//   }

//   static addListener(callback) {
//     this.listeners.push(callback);
//   }

//   static removeListener(callback) {
//     this.listeners = this.listeners.filter(listener => listener !== callback);
//   }

//   static notifyListeners() {
//     this.listeners.forEach(callback => callback());
//   }

//   static async refreshToken() {
//     if (this.REFRESH_IN_PROGRESS) {
//       return new Promise((resolve, reject) => {
//         this.REFRESH_QUEUE.push({ resolve, reject });
//       });
//     }

//     this.REFRESH_IN_PROGRESS = true;
//     this.isRefreshing = true;
//     const refreshToken = this.getRefreshToken();

//     if (!refreshToken) {
//       this.REFRESH_IN_PROGRESS = false;
//       this.isRefreshing = false;
//       this.handleQueue(false);
//       throw new Error('No refresh token available');
//     }

//     try {
//       console.log('🔄 Refreshing token...');
//       const response = await fetch(API_CONFIG.REFRESH_TOKEN_API.BASE_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CPO-App-ID': CPO_APP_ID
//         },
//         body: JSON.stringify({ refresh_token: refreshToken }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         const { access_token, refresh_token, expires_in } = data;
        
//         this.saveTokens(access_token, refresh_token, expires_in);
        
//         try {
//           const decodedToken = jwtDecode(access_token);
//           const userEmail = localStorage.getItem('userEmail');
//           const cpoId = localStorage.getItem('cpoId');
//           const userInfo = {
//             name: decodedToken.name || decodedToken.firstname || 'User',
//             email: decodedToken.email || userEmail || '',
//             scope: 'CPO',
//             cpoId: cpoId || '',
//             userId: decodedToken.sub || decodedToken.userId || decodedToken.id
//           };
//           localStorage.setItem('userInfo', JSON.stringify(userInfo));
//         } catch (decodeError) {
//           console.error('Error decoding refreshed token:', decodeError);
//         }

//         console.log('✅ Token refreshed successfully');
//         this.REFRESH_IN_PROGRESS = false;
//         this.isRefreshing = false;
//         this.handleQueue(true, access_token);
//         this.notifyListeners();
//         return access_token;
//       } else {
//         console.error('❌ Refresh token failed:', data);
//         this.clearTokens();
//         this.REFRESH_IN_PROGRESS = false;
//         this.isRefreshing = false;
//         this.handleQueue(false);
//         window.dispatchEvent(new CustomEvent('session_expired', { detail: { message: data.message || 'Session expired' } }));
//         throw new Error('Session expired. Please login again.');
//       }
//     } catch (error) {
//       console.error('❌ Refresh token error:', error);
//       this.clearTokens();
//       this.REFRESH_IN_PROGRESS = false;
//       this.isRefreshing = false;
//       this.handleQueue(false);
//       window.dispatchEvent(new CustomEvent('session_expired', { detail: { message: error.message } }));
//       throw error;
//     }
//   }

//   static handleQueue(success, token) {
//     while (this.REFRESH_QUEUE.length > 0) {
//       const { resolve, reject } = this.REFRESH_QUEUE.shift();
//       if (success && token) {
//         resolve(token);
//       } else {
//         reject(new Error('Session expired. Please login again.'));
//       }
//     }
//   }

//   static getHeaders(extraHeaders = {}) {
//     const token = this.getAccessToken();
//     const headers = {
//       'Content-Type': 'application/json',
//       'X-CPO-App-ID': CPO_APP_ID,
//       ...extraHeaders
//     };
    
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     return headers;
//   }

//   static async authenticatedRequest(url, options = {}) {
//     let accessToken = this.getAccessToken();

//     // Check if token exists and is not expired
//     if (accessToken && this.isTokenExpired()) {
//       try {
//         accessToken = await this.refreshToken();
//       } catch (error) {
//         throw error;
//       }
//     }

//     if (!accessToken) {
//       throw new Error('No access token available');
//     }

//     // Prepare headers - always include X-CPO-App-ID
//     const headers = {
//       'Authorization': `Bearer ${accessToken}`,
//       'X-CPO-App-ID': CPO_APP_ID,
//       ...options.headers
//     };

//     // If body is FormData, don't set Content-Type (browser will set it with boundary)
//     if (!(options.body instanceof FormData)) {
//       headers['Content-Type'] = 'application/json';
//     }

//     // Make the request
//     const response = await fetch(url, {
//       ...options,
//       headers: headers,
//     });

//     // If we get a 401, try refreshing once more
//     if (response.status === 401) {
//       try {
//         accessToken = await this.refreshToken();
//         // Retry the request with new token
//         const retryHeaders = {
//           'Authorization': `Bearer ${accessToken}`,
//           'X-CPO-App-ID': CPO_APP_ID,
//           ...options.headers
//         };
        
//         if (!(options.body instanceof FormData)) {
//           retryHeaders['Content-Type'] = 'application/json';
//         }
        
//         const retryResponse = await fetch(url, {
//           ...options,
//           headers: retryHeaders,
//         });
//         return retryResponse;
//       } catch (error) {
//         throw error;
//       }
//     }

//     // Handle 400 Bad Request - log the response for debugging
//     if (response.status === 400) {
//       const errorData = await response.clone().json().catch(() => ({}));
//       console.error('❌ 400 Bad Request:', {
//         url,
//         status: response.status,
//         error: errorData,
//         headers: headers
//       });
//     }

//     return response;
//   }
// }

// // Auth Context
// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const navigate = useNavigate();
//   const refreshIntervalRef = useRef(null);
//   const tokenCheckIntervalRef = useRef(null);
//   const isMounted = useRef(true);

//   // Check authentication status
//   const checkAuth = () => {
//     if (!isMounted.current) return false;
    
//     const token = TokenManager.getAccessToken();
//     const userInfo = localStorage.getItem('userInfo');
//     const refreshToken = TokenManager.getRefreshToken();
    
//     if (token && refreshToken && !TokenManager.isTokenExpired()) {
//       setIsAuthenticated(true);
//       if (userInfo) {
//         try {
//           setUser(JSON.parse(userInfo));
//         } catch (e) {
//           setUser(null);
//         }
//       }
//       return true;
//     } else if (token && refreshToken && TokenManager.isTokenExpired()) {
//       // Token expired, try to refresh silently
//       TokenManager.refreshToken()
//         .then(() => {
//           if (isMounted.current) {
//             setIsAuthenticated(true);
//             const userInfo = localStorage.getItem('userInfo');
//             if (userInfo) {
//               try {
//                 setUser(JSON.parse(userInfo));
//               } catch (e) {
//                 setUser(null);
//               }
//             }
//           }
//         })
//         .catch(() => {
//           if (isMounted.current) {
//             setIsAuthenticated(false);
//             setUser(null);
//             if (window.location.pathname !== '/signin') {
//               navigate('/signin', { replace: true });
//             }
//           }
//         });
//       return false;
//     } else {
//       setIsAuthenticated(false);
//       setUser(null);
//       return false;
//     }
//   };

//   // Listen for token changes
//   useEffect(() => {
//     const handleTokenChange = () => {
//       if (isMounted.current) {
//         checkAuth();
//       }
//     };

//     TokenManager.addListener(handleTokenChange);

//     return () => {
//       TokenManager.removeListener(handleTokenChange);
//     };
//   }, []);

//   // Listen for session expired event
//   useEffect(() => {
//     const handleSessionExpired = (event) => {
//       if (isMounted.current) {
//         setIsAuthenticated(false);
//         setUser(null);
//         if (window.location.pathname !== '/signin') {
//           navigate('/signin', { replace: true });
//         }
//       }
//     };

//     window.addEventListener('session_expired', handleSessionExpired);

//     return () => {
//       window.removeEventListener('session_expired', handleSessionExpired);
//     };
//   }, [navigate]);

//   // Initial auth check
//   useEffect(() => {
//     isMounted.current = true;
//     checkAuth();
//     setLoading(false);

//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   // Setup auto-refresh interval
//   useEffect(() => {
//     refreshIntervalRef.current = setInterval(() => {
//       if (!isMounted.current) return;
      
//       const token = TokenManager.getAccessToken();
//       const refreshToken = TokenManager.getRefreshToken();
      
//       if (token && refreshToken && TokenManager.isTokenExpired()) {
//         setIsRefreshing(true);
//         TokenManager.refreshToken()
//           .then(() => {
//             if (isMounted.current) {
//               setIsRefreshing(false);
//               setIsAuthenticated(true);
//               const userInfo = localStorage.getItem('userInfo');
//               if (userInfo) {
//                 try {
//                   setUser(JSON.parse(userInfo));
//                 } catch (e) {
//                   setUser(null);
//                 }
//               }
//             }
//           })
//           .catch(() => {
//             if (isMounted.current) {
//               setIsRefreshing(false);
//               setIsAuthenticated(false);
//               setUser(null);
//               if (window.location.pathname !== '/signin') {
//                 navigate('/signin', { replace: true });
//               }
//             }
//           });
//       }
//     }, 15000);

//     tokenCheckIntervalRef.current = setInterval(() => {
//       if (!isMounted.current) return;
      
//       const token = TokenManager.getAccessToken();
//       const refreshToken = TokenManager.getRefreshToken();
      
//       if (token && refreshToken && TokenManager.isTokenExpired()) {
//         setIsAuthenticated(false);
//         setUser(null);
//         if (window.location.pathname !== '/signin') {
//           navigate('/signin', { replace: true });
//         }
//       }
//     }, 30000);

//     return () => {
//       if (refreshIntervalRef.current) {
//         clearInterval(refreshIntervalRef.current);
//       }
//       if (tokenCheckIntervalRef.current) {
//         clearInterval(tokenCheckIntervalRef.current);
//       }
//     };
//   }, [navigate]);

//   // Login function
//   const login = (accessToken, refreshToken, expiresIn, userInfo) => {
//     TokenManager.saveTokens(accessToken, refreshToken, expiresIn);
//     if (userInfo) {
//       localStorage.setItem('userInfo', JSON.stringify(userInfo));
//       setUser(userInfo);
//     }
//     setIsAuthenticated(true);
//   };

//   // Logout function
//   const logout = () => {
//     TokenManager.clearTokens();
//     setIsAuthenticated(false);
//     setUser(null);
//     navigate('/signin', { replace: true });
//   };

//   // Refresh token function
//   const refreshToken = async () => {
//     try {
//       const token = await TokenManager.refreshToken();
//       return token;
//     } catch (error) {
//       logout();
//       throw error;
//     }
//   };

//   // Authenticated request function with proper headers
//   const authenticatedRequest = async (url, options = {}) => {
//     try {
//       return await TokenManager.authenticatedRequest(url, options);
//     } catch (error) {
//       if (error.message === 'Session expired. Please login again.') {
//         logout();
//       }
//       throw error;
//     }
//   };

//   const value = {
//     isAuthenticated,
//     loading,
//     user,
//     isRefreshing,
//     login,
//     logout,
//     refreshToken,
//     authenticatedRequest,
//     getAccessToken: TokenManager.getAccessToken.bind(TokenManager),
//     getRefreshToken: TokenManager.getRefreshToken.bind(TokenManager),
//     isTokenExpired: TokenManager.isTokenExpired.bind(TokenManager),
//     getHeaders: TokenManager.getHeaders.bind(TokenManager),
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export { TokenManager };

// src/context/AuthContext.jsx
// src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://dev-evcmsnew.transev.site';

const CPO_APP_ID =
  process.env.REACT_APP_CPO_APP_ID ||
  'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

const API_CONFIG = {
  REFRESH_TOKEN_API:
    `${API_BASE_URL}/api/v1/auth/refresh`,
};

// ======================================================
// AUTH CONTEXT
// ======================================================

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  // ====================================================
  // IMPORTANT
  // ====================================================
  // Do NOT use React state to lock refresh.
  //
  // Multiple components can call authenticatedRequest()
  // at exactly the same time.
  //
  // This ref stores ONE common refresh Promise.
  // Therefore only ONE /auth/refresh request is sent.
  // ====================================================

  const refreshPromiseRef = useRef(null);

  const refreshTimerRef = useRef(null);

  const isMountedRef = useRef(true);

  // ======================================================
  // PUBLIC ROUTES
  // ======================================================

  const isPublicPage =
    location.pathname === '/signin' ||
    location.pathname === '/' ||
    location.pathname === '/forgot-password';

  // ======================================================
  // LOCAL STORAGE HELPERS
  // ======================================================

  const getAccessToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const getRefreshToken = useCallback(() => {
    return localStorage.getItem('refresh_token');
  }, []);

  const getTokenExpiry = useCallback(() => {
    return localStorage.getItem('token_expiry');
  }, []);

  // ======================================================
  // SAVE TOKENS
  // ======================================================
  //
  // Backend returns:
  //
  // access_token
  // access_token_expires_at
  // refresh_token
  // session_expires_at
  //
  // NOT expires_in.
  //
  // ======================================================

  const saveTokens = useCallback(
    (
      accessToken,
      refreshTokenValue,
      accessTokenExpiresAt,
      sessionExpiresAt
    ) => {
      console.log('💾 Saving authentication tokens...');

      // ----------------------------------------------
      // ACCESS TOKEN
      // ----------------------------------------------

      if (accessToken) {
        localStorage.setItem(
          'token',
          accessToken
        );
      }

      // ----------------------------------------------
      // REFRESH TOKEN
      // ----------------------------------------------
      //
      // VERY IMPORTANT:
      //
      // Backend rotates refresh token after every
      // successful refresh.
      //
      // So always replace the old refresh token with
      // the new one returned by backend.
      //
      // ----------------------------------------------

      if (refreshTokenValue) {
        localStorage.setItem(
          'refresh_token',
          refreshTokenValue
        );
      }

      // ----------------------------------------------
      // ACCESS TOKEN EXPIRY
      // ----------------------------------------------

      if (accessTokenExpiresAt) {
        const expiryTime =
          new Date(
            accessTokenExpiresAt
          ).getTime();

        if (!Number.isNaN(expiryTime)) {
          localStorage.setItem(
            'token_expiry',
            expiryTime.toString()
          );

          console.log(
            '⏰ Access token expiry:',
            new Date(expiryTime).toISOString()
          );
        }
      }

      // ----------------------------------------------
      // SESSION EXPIRY
      // ----------------------------------------------

      if (sessionExpiresAt) {
        localStorage.setItem(
          'session_expiry',
          new Date(
            sessionExpiresAt
          ).getTime().toString()
        );
      }
    },
    []
  );

  // ======================================================
  // CLEAR TOKENS
  // ======================================================

  const clearTokens = useCallback(() => {
    console.log('🧹 Clearing authentication tokens...');

    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('session_expiry');
    localStorage.removeItem('userInfo');
  }, []);

  // ======================================================
  // CHECK TOKEN EXPIRY
  // ======================================================

  const isTokenExpired = useCallback(() => {
    const expiry =
      getTokenExpiry();

    // No expiry information
    if (!expiry) {
      return true;
    }

    const expiryTime =
      Number(expiry);

    if (
      Number.isNaN(expiryTime)
    ) {
      return true;
    }

    const remaining =
      expiryTime - Date.now();

    console.log(
      '⏳ Access token remaining:',
      Math.round(remaining / 1000),
      'seconds'
    );

    // Refresh 60 seconds before actual expiry
    return remaining <= 60000;
  }, [getTokenExpiry]);

  // ======================================================
  // SAVE USER INFO
  // ======================================================

  const saveUserInfo = useCallback(
    (userInfo) => {
      if (!userInfo) {
        return;
      }

      localStorage.setItem(
        'userInfo',
        JSON.stringify(userInfo)
      );

      if (isMountedRef.current) {
        setUser(userInfo);
      }
    },
    []
  );

  // ======================================================
  // LOGOUT / INVALID SESSION
  // ======================================================

  const handleInvalidSession = useCallback(() => {
    console.error(
      '🚨 Authentication session is invalid'
    );

    clearTokens();

    if (isMountedRef.current) {
      setIsAuthenticated(false);
      setUser(null);
      setIsRefreshing(false);
    }

    if (refreshTimerRef.current) {
      clearTimeout(
        refreshTimerRef.current
      );

      refreshTimerRef.current = null;
    }

    if (
      location.pathname !== '/signin'
    ) {
      navigate('/signin', {
        replace: true,
      });
    }
  }, [
    clearTokens,
    location.pathname,
    navigate,
  ]);

  // ======================================================
  // REFRESH TOKEN
  // ======================================================

  const refreshToken = useCallback(
    async () => {
      // =================================================
      // IMPORTANT:
      //
      // If another API call is already refreshing,
      // DO NOT send another refresh request.
      //
      // Wait for the existing Promise.
      // =================================================

      if (
        refreshPromiseRef.current
      ) {
        console.log(
          '⏳ Refresh already running. Waiting...'
        );

        return refreshPromiseRef.current;
      }

      const storedRefreshToken =
        getRefreshToken();

      if (!storedRefreshToken) {
        console.error(
          '❌ No refresh token available'
        );

        handleInvalidSession();

        return null;
      }

      // =================================================
      // CREATE ONE REFRESH PROMISE
      // =================================================

      refreshPromiseRef.current =
        (async () => {
          try {
            if (
              isMountedRef.current
            ) {
              setIsRefreshing(true);
            }

            console.log(
              '🔄 Sending refresh request...'
            );

            const response =
              await fetch(
                API_CONFIG.REFRESH_TOKEN_API,
                {
                  method: 'POST',

                  headers: {
                    'Content-Type':
                      'application/json',

                    Accept:
                      'application/json',

                    'X-CPO-App-ID':
                      CPO_APP_ID,
                  },

                  body: JSON.stringify({
                    refresh_token:
                      storedRefreshToken.trim(),
                  }),
                }
              );

            let data = null;

            try {
              data =
                await response.json();
            } catch (jsonError) {
              console.error(
                '❌ Could not parse refresh response'
              );
            }

            console.log(
              '📥 Refresh status:',
              response.status
            );

            console.log(
              '📥 Refresh response:',
              data
            );

            // =================================================
            // SUCCESS
            // =================================================

            if (
              response.ok &&
              data?.access_token &&
              data?.refresh_token
            ) {
              console.log(
                '✅ Refresh successful'
              );

              // =============================================
              // Backend sends:
              //
              // access_token_expires_at
              // refresh_token
              // session_expires_at
              //
              // =============================================

              saveTokens(
                data.access_token,
                data.refresh_token,
                data.access_token_expires_at,
                data.session_expires_at
              );

              if (
                isMountedRef.current
              ) {
                setIsAuthenticated(true);
              }

              console.log(
                '🔐 New access token saved'
              );

              console.log(
                '🔄 New refresh token saved'
              );

              return data.access_token;
            }

            // =================================================
            // INVALID REFRESH TOKEN
            // =================================================

            console.error(
              '❌ Backend rejected refresh token:',
              {
                status:
                  response.status,
                data,
              }
            );

            handleInvalidSession();

            return null;
          } catch (error) {
            console.error(
              '❌ Refresh request failed:',
              error
            );

            handleInvalidSession();

            return null;
          } finally {
            if (
              isMountedRef.current
            ) {
              setIsRefreshing(false);
            }
          }
        })();

      // =================================================
      // IMPORTANT:
      //
      // Clear promise ONLY after it finishes.
      // =================================================

      try {
        return await refreshPromiseRef.current;
      } finally {
        refreshPromiseRef.current = null;
      }
    },
    [
      getRefreshToken,
      saveTokens,
      handleInvalidSession,
    ]
  );

  // ======================================================
  // CHECK AUTH ON APP START
  // ======================================================

  const checkAuth = useCallback(
    async () => {
      const accessToken =
        getAccessToken();

      const storedRefreshToken =
        getRefreshToken();

      const storedUserInfo =
        localStorage.getItem(
          'userInfo'
        );

      console.log(
        '🔐 Checking authentication...'
      );

      console.log(
        'Access token exists:',
        !!accessToken
      );

      console.log(
        'Refresh token exists:',
        !!storedRefreshToken
      );

      // =================================================
      // NO TOKENS
      // =================================================

      if (
        !accessToken ||
        !storedRefreshToken
      ) {
        setIsAuthenticated(false);
        setUser(null);

        return false;
      }

      // =================================================
      // RESTORE USER
      // =================================================

      if (storedUserInfo) {
        try {
          const parsedUser =
            JSON.parse(
              storedUserInfo
            );

          setUser(parsedUser);
        } catch (error) {
          console.error(
            '❌ Invalid userInfo in localStorage'
          );
        }
      }

      // =================================================
      // ACCESS TOKEN EXPIRED / EXPIRING
      // =================================================

      if (
        isTokenExpired()
      ) {
        console.log(
          '⏰ Access token expired or expiring'
        );

        const newAccessToken =
          await refreshToken();

        if (!newAccessToken) {
          return false;
        }
      }

      setIsAuthenticated(true);

      return true;
    },
    [
      getAccessToken,
      getRefreshToken,
      isTokenExpired,
      refreshToken,
    ]
  );

  // ======================================================
  // AUTO REFRESH TIMER
  // ======================================================

  const setupRefreshTimer =
    useCallback(() => {
      // Clear previous timer
      if (
        refreshTimerRef.current
      ) {
        clearTimeout(
          refreshTimerRef.current
        );

        refreshTimerRef.current = null;
      }

      if (
        !isAuthenticated ||
        isPublicPage
      ) {
        return;
      }

      const expiry =
        Number(
          getTokenExpiry()
        );

      if (
        !expiry ||
        Number.isNaN(expiry)
      ) {
        console.warn(
          '⚠️ No valid token expiry found'
        );

        return;
      }

      const remaining =
        expiry - Date.now();

      // Refresh 60 seconds before expiry
      const refreshAfter =
        Math.max(
          remaining - 60000,
          5000
        );

      console.log(
        '⏰ Auto refresh scheduled in:',
        Math.round(
          refreshAfter / 1000
        ),
        'seconds'
      );

      refreshTimerRef.current =
        setTimeout(
          async () => {
            console.log(
              '⏰ Auto refresh started'
            );

            const accessToken =
              getAccessToken();

            const storedRefreshToken =
              getRefreshToken();

            if (
              accessToken &&
              storedRefreshToken
            ) {
              await refreshToken();
            }

            // Schedule next refresh
            if (
              isMountedRef.current
            ) {
              setupRefreshTimer();
            }
          },
          refreshAfter
        );
    }, [
      isAuthenticated,
      isPublicPage,
      getTokenExpiry,
      getAccessToken,
      getRefreshToken,
      refreshToken,
    ]);

  // ======================================================
  // INITIAL AUTH
  // ======================================================

  useEffect(() => {
    isMountedRef.current = true;

    const initializeAuth =
      async () => {
        if (isPublicPage) {
          setLoading(false);
          return;
        }

        try {
          await checkAuth();
        } catch (error) {
          console.error(
            '❌ Authentication initialization failed:',
            error
          );

          setIsAuthenticated(false);
        } finally {
          if (
            isMountedRef.current
          ) {
            setLoading(false);
          }
        }
      };

    initializeAuth();

    return () => {
      isMountedRef.current =
        false;
    };
  }, [
    isPublicPage,
    checkAuth,
  ]);

  // ======================================================
  // SETUP AUTO REFRESH
  // ======================================================

  useEffect(() => {
    setupRefreshTimer();

    return () => {
      if (
        refreshTimerRef.current
      ) {
        clearTimeout(
          refreshTimerRef.current
        );

        refreshTimerRef.current =
          null;
      }
    };
  }, [
    setupRefreshTimer,
  ]);

  // ======================================================
  // LOGIN
  // ======================================================

  const login = useCallback(
    (
      accessToken,
      refreshTokenValue,
      accessTokenExpiresAt,
      userInfo,
      sessionExpiresAt
    ) => {
      console.log(
        '🔐 Login called'
      );

      if (
        !accessToken ||
        !refreshTokenValue
      ) {
        console.error(
          '❌ Missing access_token or refresh_token'
        );

        return false;
      }

      // Clear any previous refresh promise
      refreshPromiseRef.current =
        null;

      // Save backend token response
      saveTokens(
        accessToken,
        refreshTokenValue,
        accessTokenExpiresAt,
        sessionExpiresAt
      );

      // Save user
      if (userInfo) {
        saveUserInfo(
          userInfo
        );
      }

      setIsAuthenticated(true);
      setIsRefreshing(false);

      console.log(
        '✅ Login successful'
      );

      return true;
    },
    [
      saveTokens,
      saveUserInfo,
    ]
  );

  // ======================================================
  // LOGOUT
  // ======================================================

  const logout = useCallback(
    () => {
      console.log(
        '🚪 Logout called'
      );

      refreshPromiseRef.current =
        null;

      clearTokens();

      setIsAuthenticated(false);
      setUser(null);
      setIsRefreshing(false);

      if (
        refreshTimerRef.current
      ) {
        clearTimeout(
          refreshTimerRef.current
        );

        refreshTimerRef.current =
          null;
      }

      navigate('/signin', {
        replace: true,
      });
    },
    [
      clearTokens,
      navigate,
    ]
  );

  // ======================================================
  // BUILD REQUEST HEADERS
  // ======================================================

  const buildHeaders = useCallback(
    (
      token,
      options
    ) => {
      const headers = {
        Authorization:
          `Bearer ${token}`,

        'X-CPO-App-ID':
          CPO_APP_ID,

        ...(options.headers || {}),
      };

      if (
        !(options.body instanceof FormData) &&
        !headers['Content-Type']
      ) {
        headers['Content-Type'] =
          'application/json';
      }

      return headers;
    },
    []
  );

  // ======================================================
  // AUTHENTICATED REQUEST
  // ======================================================

  const authenticatedRequest =
    useCallback(
      async (
        url,
        options = {}
      ) => {
        let token =
          getAccessToken();

        // =================================================
        // NO ACCESS TOKEN
        // =================================================

        if (!token) {
          console.error(
            '❌ No access token available'
          );

          throw new Error(
            'No access token available'
          );
        }

        // =================================================
        // REFRESH BEFORE REQUEST
        // =================================================

        if (
          isTokenExpired()
        ) {
          console.log(
            '⏰ Token expired/expiring before API request'
          );

          const newToken =
            await refreshToken();

          if (!newToken) {
            throw new Error(
              'Failed to refresh token'
            );
          }

          token = newToken;
        }

        // =================================================
        // FIRST API REQUEST
        // =================================================

        let response =
          await fetch(
            url,
            {
              ...options,

              headers:
                buildHeaders(
                  token,
                  options
                ),
            }
          );

        // =================================================
        // 401 HANDLING
        // =================================================
        //
        // Backend access token can become invalid even
        // if local expiry says otherwise.
        //
        // Refresh exactly ONCE and retry exactly ONCE.
        //
        // =================================================

        if (
          response.status === 401
        ) {
          console.warn(
            '🔑 API returned 401. Attempting token refresh...'
          );

          const newToken =
            await refreshToken();

          if (!newToken) {
            throw new Error(
              'Failed to refresh token'
            );
          }

          response =
            await fetch(
              url,
              {
                ...options,

                headers:
                  buildHeaders(
                    newToken,
                    options
                  ),
              }
            );

          // =================================================
          // SECOND 401
          // =================================================

          if (
            response.status === 401
          ) {
            console.error(
              '❌ API still returned 401 after refresh'
            );

            handleInvalidSession();

            throw new Error(
              'Authentication failed'
            );
          }
        }

        return response;
      },
      [
        getAccessToken,
        isTokenExpired,
        refreshToken,
        buildHeaders,
        handleInvalidSession,
      ]
    );

  // ======================================================
  // CONTEXT VALUE
  // ======================================================

  const value = {
    isAuthenticated,
    loading,
    user,
    isRefreshing,

    login,
    logout,

    refreshToken,
    authenticatedRequest,

    getAccessToken,
    getRefreshToken,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ======================================================
// useAuth
// ======================================================

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export default AuthContext;

