// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
// } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';

// // ======================================================
// // API CONFIGURATION
// // ======================================================

// const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL ||
//   'https://dev-evcmsnew.transev.site';

// const CPO_APP_ID =
//   process.env.REACT_APP_CPO_APP_ID ||
//   'cpo_dummy_5f75674f57829da5f3cae19ef4238d56';

// const API_CONFIG = {
//   REFRESH_TOKEN_API:
//     `${API_BASE_URL}/api/v1/auth/refresh`,
// };

// // ======================================================
// // AUTH CONTEXT
// // ======================================================

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [isAuthenticated, setIsAuthenticated] =
//     useState(false);

//   const [loading, setLoading] =
//     useState(true);

//   const [user, setUser] =
//     useState(null);

//   const [isRefreshing, setIsRefreshing] =
//     useState(false);

//   // ====================================================
//   // IMPORTANT
//   // ====================================================
//   // Do NOT use React state to lock refresh.
//   //
//   // Multiple components can call authenticatedRequest()
//   // at exactly the same time.
//   //
//   // This ref stores ONE common refresh Promise.
//   // Therefore only ONE /auth/refresh request is sent.
//   // ====================================================

//   const refreshPromiseRef = useRef(null);

//   const refreshTimerRef = useRef(null);

//   const isMountedRef = useRef(true);

//   // ======================================================
//   // PUBLIC ROUTES
//   // ======================================================

//   const isPublicPage =
//     location.pathname === '/signin' ||
//     location.pathname === '/' ||
//     location.pathname === '/forgot-password';

//   // ======================================================
//   // LOCAL STORAGE HELPERS
//   // ======================================================

//   const getAccessToken = useCallback(() => {
//     return localStorage.getItem('token');
//   }, []);

//   const getRefreshToken = useCallback(() => {
//     return localStorage.getItem('refresh_token');
//   }, []);

//   const getTokenExpiry = useCallback(() => {
//     return localStorage.getItem('token_expiry');
//   }, []);

//   // ======================================================
//   // SAVE TOKENS
//   // ======================================================
//   //
//   // Backend returns:
//   //
//   // access_token
//   // access_token_expires_at
//   // refresh_token
//   // session_expires_at
//   //
//   // NOT expires_in.
//   //
//   // ======================================================

//   const saveTokens = useCallback(
//     (
//       accessToken,
//       refreshTokenValue,
//       accessTokenExpiresAt,
//       sessionExpiresAt
//     ) => {
//       console.log('💾 Saving authentication tokens...');

//       // ----------------------------------------------
//       // ACCESS TOKEN
//       // ----------------------------------------------

//       if (accessToken) {
//         localStorage.setItem(
//           'token',
//           accessToken
//         );
//       }

//       // ----------------------------------------------
//       // REFRESH TOKEN
//       // ----------------------------------------------
//       //
//       // VERY IMPORTANT:
//       //
//       // Backend rotates refresh token after every
//       // successful refresh.
//       //
//       // So always replace the old refresh token with
//       // the new one returned by backend.
//       //
//       // ----------------------------------------------

//       if (refreshTokenValue) {
//         localStorage.setItem(
//           'refresh_token',
//           refreshTokenValue
//         );
//       }

//       // ----------------------------------------------
//       // ACCESS TOKEN EXPIRY
//       // ----------------------------------------------

//       if (accessTokenExpiresAt) {
//         const expiryTime =
//           new Date(
//             accessTokenExpiresAt
//           ).getTime();

//         if (!Number.isNaN(expiryTime)) {
//           localStorage.setItem(
//             'token_expiry',
//             expiryTime.toString()
//           );

//           console.log(
//             '⏰ Access token expiry:',
//             new Date(expiryTime).toISOString()
//           );
//         }
//       }

//       // ----------------------------------------------
//       // SESSION EXPIRY
//       // ----------------------------------------------

//       if (sessionExpiresAt) {
//         localStorage.setItem(
//           'session_expiry',
//           new Date(
//             sessionExpiresAt
//           ).getTime().toString()
//         );
//       }
//     },
//     []
//   );

//   // ======================================================
//   // CLEAR TOKENS
//   // ======================================================

//   const clearTokens = useCallback(() => {
//     console.log('🧹 Clearing authentication tokens...');

//     localStorage.removeItem('token');
//     localStorage.removeItem('refresh_token');
//     localStorage.removeItem('token_expiry');
//     localStorage.removeItem('session_expiry');
//     localStorage.removeItem('userInfo');
//   }, []);

//   // ======================================================
//   // CHECK TOKEN EXPIRY
//   // ======================================================

//   const isTokenExpired = useCallback(() => {
//     const expiry =
//       getTokenExpiry();

//     // No expiry information
//     if (!expiry) {
//       return true;
//     }

//     const expiryTime =
//       Number(expiry);

//     if (
//       Number.isNaN(expiryTime)
//     ) {
//       return true;
//     }

//     const remaining =
//       expiryTime - Date.now();

//     console.log(
//       '⏳ Access token remaining:',
//       Math.round(remaining / 1000),
//       'seconds'
//     );

//     // Refresh 60 seconds before actual expiry
//     return remaining <= 60000;
//   }, [getTokenExpiry]);

//   // ======================================================
//   // SAVE USER INFO
//   // ======================================================

//   const saveUserInfo = useCallback(
//     (userInfo) => {
//       if (!userInfo) {
//         return;
//       }

//       localStorage.setItem(
//         'userInfo',
//         JSON.stringify(userInfo)
//       );

//       if (isMountedRef.current) {
//         setUser(userInfo);
//       }
//     },
//     []
//   );

//   // ======================================================
//   // LOGOUT / INVALID SESSION
//   // ======================================================

//   const handleInvalidSession = useCallback(() => {
//     console.error(
//       '🚨 Authentication session is invalid'
//     );

//     clearTokens();

//     if (isMountedRef.current) {
//       setIsAuthenticated(false);
//       setUser(null);
//       setIsRefreshing(false);
//     }

//     if (refreshTimerRef.current) {
//       clearTimeout(
//         refreshTimerRef.current
//       );

//       refreshTimerRef.current = null;
//     }

//     if (
//       location.pathname !== '/signin'
//     ) {
//       navigate('/signin', {
//         replace: true,
//       });
//     }
//   }, [
//     clearTokens,
//     location.pathname,
//     navigate,
//   ]);

//   // ======================================================
//   // REFRESH TOKEN
//   // ======================================================

//   const refreshToken = useCallback(
//     async () => {
//       // =================================================
//       // IMPORTANT:
//       //
//       // If another API call is already refreshing,
//       // DO NOT send another refresh request.
//       //
//       // Wait for the existing Promise.
//       // =================================================

//       if (
//         refreshPromiseRef.current
//       ) {
//         console.log(
//           '⏳ Refresh already running. Waiting...'
//         );

//         return refreshPromiseRef.current;
//       }

//       const storedRefreshToken =
//         getRefreshToken();

//       if (!storedRefreshToken) {
//         console.error(
//           '❌ No refresh token available'
//         );

//         handleInvalidSession();

//         return null;
//       }

//       // =================================================
//       // CREATE ONE REFRESH PROMISE
//       // =================================================

//       refreshPromiseRef.current =
//         (async () => {
//           try {
//             if (
//               isMountedRef.current
//             ) {
//               setIsRefreshing(true);
//             }

//             console.log(
//               '🔄 Sending refresh request...'
//             );

//             const response =
//               await fetch(
//                 API_CONFIG.REFRESH_TOKEN_API,
//                 {
//                   method: 'POST',

//                   headers: {
//                     'Content-Type':
//                       'application/json',

//                     Accept:
//                       'application/json',

//                     'X-CPO-App-ID':
//                       CPO_APP_ID,
//                   },

//                   body: JSON.stringify({
//                     refresh_token:
//                       storedRefreshToken.trim(),
//                   }),
//                 }
//               );

//             let data = null;

//             try {
//               data =
//                 await response.json();
//             } catch (jsonError) {
//               console.error(
//                 '❌ Could not parse refresh response'
//               );
//             }

//             console.log(
//               '📥 Refresh status:',
//               response.status
//             );

//             console.log(
//               '📥 Refresh response:',
//               data
//             );

//             // =================================================
//             // SUCCESS
//             // =================================================

//             if (
//               response.ok &&
//               data?.access_token &&
//               data?.refresh_token
//             ) {
//               console.log(
//                 '✅ Refresh successful'
//               );

//               // =============================================
//               // Backend sends:
//               //
//               // access_token_expires_at
//               // refresh_token
//               // session_expires_at
//               //
//               // =============================================

//               saveTokens(
//                 data.access_token,
//                 data.refresh_token,
//                 data.access_token_expires_at,
//                 data.session_expires_at
//               );

//               if (
//                 isMountedRef.current
//               ) {
//                 setIsAuthenticated(true);
//               }

//               console.log(
//                 '🔐 New access token saved'
//               );

//               console.log(
//                 '🔄 New refresh token saved'
//               );

//               return data.access_token;
//             }

//             // =================================================
//             // INVALID REFRESH TOKEN
//             // =================================================

//             console.error(
//               '❌ Backend rejected refresh token:',
//               {
//                 status:
//                   response.status,
//                 data,
//               }
//             );

//             handleInvalidSession();

//             return null;
//           } catch (error) {
//             console.error(
//               '❌ Refresh request failed:',
//               error
//             );

//             handleInvalidSession();

//             return null;
//           } finally {
//             if (
//               isMountedRef.current
//             ) {
//               setIsRefreshing(false);
//             }
//           }
//         })();

//       // =================================================
//       // IMPORTANT:
//       //
//       // Clear promise ONLY after it finishes.
//       // =================================================

//       try {
//         return await refreshPromiseRef.current;
//       } finally {
//         refreshPromiseRef.current = null;
//       }
//     },
//     [
//       getRefreshToken,
//       saveTokens,
//       handleInvalidSession,
//     ]
//   );

//   // ======================================================
//   // CHECK AUTH ON APP START
//   // ======================================================

//   const checkAuth = useCallback(
//     async () => {
//       const accessToken =
//         getAccessToken();

//       const storedRefreshToken =
//         getRefreshToken();

//       const storedUserInfo =
//         localStorage.getItem(
//           'userInfo'
//         );

//       console.log(
//         '🔐 Checking authentication...'
//       );

//       console.log(
//         'Access token exists:',
//         !!accessToken
//       );

//       console.log(
//         'Refresh token exists:',
//         !!storedRefreshToken
//       );

//       // =================================================
//       // NO TOKENS
//       // =================================================

//       if (
//         !accessToken ||
//         !storedRefreshToken
//       ) {
//         setIsAuthenticated(false);
//         setUser(null);

//         return false;
//       }

//       // =================================================
//       // RESTORE USER
//       // =================================================

//       if (storedUserInfo) {
//         try {
//           const parsedUser =
//             JSON.parse(
//               storedUserInfo
//             );

//           setUser(parsedUser);
//         } catch (error) {
//           console.error(
//             '❌ Invalid userInfo in localStorage'
//           );
//         }
//       }

//       // =================================================
//       // ACCESS TOKEN EXPIRED / EXPIRING
//       // =================================================

//       if (
//         isTokenExpired()
//       ) {
//         console.log(
//           '⏰ Access token expired or expiring'
//         );

//         const newAccessToken =
//           await refreshToken();

//         if (!newAccessToken) {
//           return false;
//         }
//       }

//       setIsAuthenticated(true);

//       return true;
//     },
//     [
//       getAccessToken,
//       getRefreshToken,
//       isTokenExpired,
//       refreshToken,
//     ]
//   );

//   // ======================================================
//   // AUTO REFRESH TIMER
//   // ======================================================

//   const setupRefreshTimer =
//     useCallback(() => {
//       // Clear previous timer
//       if (
//         refreshTimerRef.current
//       ) {
//         clearTimeout(
//           refreshTimerRef.current
//         );

//         refreshTimerRef.current = null;
//       }

//       if (
//         !isAuthenticated ||
//         isPublicPage
//       ) {
//         return;
//       }

//       const expiry =
//         Number(
//           getTokenExpiry()
//         );

//       if (
//         !expiry ||
//         Number.isNaN(expiry)
//       ) {
//         console.warn(
//           '⚠️ No valid token expiry found'
//         );

//         return;
//       }

//       const remaining =
//         expiry - Date.now();

//       // Refresh 60 seconds before expiry
//       const refreshAfter =
//         Math.max(
//           remaining - 60000,
//           5000
//         );

//       console.log(
//         '⏰ Auto refresh scheduled in:',
//         Math.round(
//           refreshAfter / 1000
//         ),
//         'seconds'
//       );

//       refreshTimerRef.current =
//         setTimeout(
//           async () => {
//             console.log(
//               '⏰ Auto refresh started'
//             );

//             const accessToken =
//               getAccessToken();

//             const storedRefreshToken =
//               getRefreshToken();

//             if (
//               accessToken &&
//               storedRefreshToken
//             ) {
//               await refreshToken();
//             }

//             // Schedule next refresh
//             if (
//               isMountedRef.current
//             ) {
//               setupRefreshTimer();
//             }
//           },
//           refreshAfter
//         );
//     }, [
//       isAuthenticated,
//       isPublicPage,
//       getTokenExpiry,
//       getAccessToken,
//       getRefreshToken,
//       refreshToken,
//     ]);

//   // ======================================================
//   // INITIAL AUTH
//   // ======================================================

//   useEffect(() => {
//     isMountedRef.current = true;

//     const initializeAuth =
//       async () => {
//         if (isPublicPage) {
//           setLoading(false);
//           return;
//         }

//         try {
//           await checkAuth();
//         } catch (error) {
//           console.error(
//             '❌ Authentication initialization failed:',
//             error
//           );

//           setIsAuthenticated(false);
//         } finally {
//           if (
//             isMountedRef.current
//           ) {
//             setLoading(false);
//           }
//         }
//       };

//     initializeAuth();

//     return () => {
//       isMountedRef.current =
//         false;
//     };
//   }, [
//     isPublicPage,
//     checkAuth,
//   ]);

//   // ======================================================
//   // SETUP AUTO REFRESH
//   // ======================================================

//   useEffect(() => {
//     setupRefreshTimer();

//     return () => {
//       if (
//         refreshTimerRef.current
//       ) {
//         clearTimeout(
//           refreshTimerRef.current
//         );

//         refreshTimerRef.current =
//           null;
//       }
//     };
//   }, [
//     setupRefreshTimer,
//   ]);

//   // ======================================================
//   // LOGIN
//   // ======================================================

//   const login = useCallback(
//     (
//       accessToken,
//       refreshTokenValue,
//       accessTokenExpiresAt,
//       userInfo,
//       sessionExpiresAt
//     ) => {
//       console.log(
//         '🔐 Login called'
//       );

//       if (
//         !accessToken ||
//         !refreshTokenValue
//       ) {
//         console.error(
//           '❌ Missing access_token or refresh_token'
//         );

//         return false;
//       }

//       // Clear any previous refresh promise
//       refreshPromiseRef.current =
//         null;

//       // Save backend token response
//       saveTokens(
//         accessToken,
//         refreshTokenValue,
//         accessTokenExpiresAt,
//         sessionExpiresAt
//       );

//       // Save user
//       if (userInfo) {
//         saveUserInfo(
//           userInfo
//         );
//       }

//       setIsAuthenticated(true);
//       setIsRefreshing(false);

//       console.log(
//         '✅ Login successful'
//       );

//       return true;
//     },
//     [
//       saveTokens,
//       saveUserInfo,
//     ]
//   );

//   // ======================================================
//   // LOGOUT
//   // ======================================================

//   const logout = useCallback(
//     () => {
//       console.log(
//         '🚪 Logout called'
//       );

//       refreshPromiseRef.current =
//         null;

//       clearTokens();

//       setIsAuthenticated(false);
//       setUser(null);
//       setIsRefreshing(false);

//       if (
//         refreshTimerRef.current
//       ) {
//         clearTimeout(
//           refreshTimerRef.current
//         );

//         refreshTimerRef.current =
//           null;
//       }

//       navigate('/signin', {
//         replace: true,
//       });
//     },
//     [
//       clearTokens,
//       navigate,
//     ]
//   );

//   // ======================================================
//   // BUILD REQUEST HEADERS
//   // ======================================================

//   const buildHeaders = useCallback(
//     (
//       token,
//       options
//     ) => {
//       const headers = {
//         Authorization:
//           `Bearer ${token}`,

//         'X-CPO-App-ID':
//           CPO_APP_ID,

//         ...(options.headers || {}),
//       };

//       if (
//         !(options.body instanceof FormData) &&
//         !headers['Content-Type']
//       ) {
//         headers['Content-Type'] =
//           'application/json';
//       }

//       return headers;
//     },
//     []
//   );

//   // ======================================================
//   // AUTHENTICATED REQUEST
//   // ======================================================

//   const authenticatedRequest =
//     useCallback(
//       async (
//         url,
//         options = {}
//       ) => {
//         let token =
//           getAccessToken();

//         // =================================================
//         // NO ACCESS TOKEN
//         // =================================================

//         if (!token) {
//           console.error(
//             '❌ No access token available'
//           );

//           throw new Error(
//             'No access token available'
//           );
//         }

//         // =================================================
//         // REFRESH BEFORE REQUEST
//         // =================================================

//         if (
//           isTokenExpired()
//         ) {
//           console.log(
//             '⏰ Token expired/expiring before API request'
//           );

//           const newToken =
//             await refreshToken();

//           if (!newToken) {
//             throw new Error(
//               'Failed to refresh token'
//             );
//           }

//           token = newToken;
//         }

//         // =================================================
//         // FIRST API REQUEST
//         // =================================================

//         let response =
//           await fetch(
//             url,
//             {
//               ...options,

//               headers:
//                 buildHeaders(
//                   token,
//                   options
//                 ),
//             }
//           );

//         // =================================================
//         // 401 HANDLING
//         // =================================================
//         //
//         // Backend access token can become invalid even
//         // if local expiry says otherwise.
//         //
//         // Refresh exactly ONCE and retry exactly ONCE.
//         //
//         // =================================================

//         if (
//           response.status === 401
//         ) {
//           console.warn(
//             '🔑 API returned 401. Attempting token refresh...'
//           );

//           const newToken =
//             await refreshToken();

//           if (!newToken) {
//             throw new Error(
//               'Failed to refresh token'
//             );
//           }

//           response =
//             await fetch(
//               url,
//               {
//                 ...options,

//                 headers:
//                   buildHeaders(
//                     newToken,
//                     options
//                   ),
//               }
//             );

//           // =================================================
//           // SECOND 401
//           // =================================================

//           if (
//             response.status === 401
//           ) {
//             console.error(
//               '❌ API still returned 401 after refresh'
//             );

//             handleInvalidSession();

//             throw new Error(
//               'Authentication failed'
//             );
//           }
//         }

//         return response;
//       },
//       [
//         getAccessToken,
//         isTokenExpired,
//         refreshToken,
//         buildHeaders,
//         handleInvalidSession,
//       ]
//     );

//   // ======================================================
//   // CONTEXT VALUE
//   // ======================================================

//   const value = {
//     isAuthenticated,
//     loading,
//     user,
//     isRefreshing,

//     login,
//     logout,

//     refreshToken,
//     authenticatedRequest,

//     getAccessToken,
//     getRefreshToken,
//     isTokenExpired,
//   };

//   return (
//     <AuthContext.Provider
//       value={value}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ======================================================
// // useAuth
// // ======================================================

// export const useAuth = () => {
//   const context =
//     useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       'useAuth must be used within an AuthProvider'
//     );
//   }

//   return context;
// };

// export default AuthContext;

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/* ============================================================
   CONFIGURATION
   ============================================================
   REACT_APP_CPO_APP_ID is public routing metadata, NOT a secret.
   It must never be typed by the user and never appear in a URL.

   .env
   -----------------------------------------------------------
   REACT_APP_API_BASE_URL=https://dev-evcmsnew.transev.site
   REACT_APP_CPO_APP_ID=cpo_dummy_735f36a898b84ce68a350db38c90bf9b
   ============================================================ */

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://dev-evcmsnew.transev.site';

export const CPO_APP_ID = (process.env.REACT_APP_CPO_APP_ID || '').trim();

const APP_ID_PATTERN = /^[a-z0-9_-]{16,100}$/;

export const isAppIdConfigured = () => APP_ID_PATTERN.test(CPO_APP_ID);

const ENDPOINTS = {
  login: `${API_BASE_URL}/api/v1/auth/login`,
  verify2fa: `${API_BASE_URL}/api/v1/auth/2fa/verify`,
  resend2fa: `${API_BASE_URL}/api/v1/auth/2fa/resend`,
  refresh: `${API_BASE_URL}/api/v1/auth/refresh`,
  me: `${API_BASE_URL}/api/v1/auth/me`,
  logout: `${API_BASE_URL}/api/v1/auth/logout`,
  logoutAll: `${API_BASE_URL}/api/v1/auth/logout-all`,
  sessions: `${API_BASE_URL}/api/v1/auth/sessions`,
  changePassword: `${API_BASE_URL}/api/v1/auth/password/change`,
};

/* ============================================================
   AUTH PHASES
   ============================================================ */

export const PHASE = {
  BOOTSTRAPPING: 'BOOTSTRAPPING',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED',
  AUTHENTICATED: 'AUTHENTICATED',
};

/* ============================================================
   PERSISTENT SESSION STORAGE
   ============================================================
   The whole token set lives under ONE key so access token,
   refresh token and both expiries are always replaced together
   (atomic rotation). localStorage is used so the session
   survives a browser restart until session_expires_at.
   ============================================================ */

const STORAGE_KEY = 'transev.cpo.session.v2';

/* Keys written by the previous implementation. */
const LEGACY_KEYS = [
  'token',
  'refresh_token',
  'token_expiry',
  'session_expiry',
  'userInfo',
  'userEmail',
  'cpoId',
];

const toMillis = (value) => {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

const readSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session?.accessToken || !session?.refreshToken) return null;

    return session;
  } catch {
    return null;
  }
};

const writeSession = (session) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage full or blocked — the in-memory session still works */
  }
};

const removeSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
};

/* Build a session object from any token response. */
const sessionFromTokenResponse = (data) => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  accessTokenExpiresAt: toMillis(data.access_token_expires_at),
  sessionExpiresAt: toMillis(data.session_expires_at),
  cpoAppId: data.cpo_app_id || CPO_APP_ID,
  cpoAppIdMode: data.cpo_app_id_mode || null,
  mustChangePassword: Boolean(data.must_change_password),
});

/* ============================================================
   ERRORS
   ============================================================ */

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const readBody = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/* The backend keeps credential failures deliberately generic,
   so the UI copy must stay generic too. */
const GENERIC_LOGIN_FAILURE = 'Unable to sign in with the supplied credentials.';

export const describeError = (status, body, fallback) => {
  const code =
    body?.code ||
    body?.error?.code ||
    (typeof body?.error === 'string' ? body.error : null) ||
    body?.message?.code ||
    null;

  switch (status) {
    case 400:
      return 'This request was rejected by the server. The app needs an update — please contact support.';
    case 401:
      if (code === 'invalid_challenge') {
        return 'That code is not valid any more. Request a new one.';
      }
      return GENERIC_LOGIN_FAILURE;
    case 403:
      if (code === 'password_change_required') {
        return 'Change your password before continuing.';
      }
      break;
    case 429:
      return 'Too many attempts. Wait a minute before trying again.';
    case 503:
      if (code === 'mail_unavailable') {
        return 'Verification email cannot be sent right now. Try again shortly.';
      }
      return 'The service is temporarily unavailable. Try again shortly.';
    default:
      break;
  }

  if (status >= 500) {
    return 'The server ran into a problem. Try again in a moment.';
  }

  const message =
    (typeof body?.message === 'string' && body.message) ||
    (typeof body?.message?.message === 'string' && body.message.message) ||
    (typeof body?.error?.message === 'string' && body.error.message) ||
    null;

  return message || fallback || 'Something went wrong. Try again.';
};

/* ============================================================
   CONTEXT
   ============================================================ */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [phase, setPhase] = useState(PHASE.BOOTSTRAPPING);
  const [user, setUser] = useState(null);
  const [cpoContext, setCpoContext] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* Tokens live in a ref as well as localStorage: the ref is the
     value every in-flight request reads, so a rotation is visible
     immediately without waiting for a re-render. */
  const sessionRef = useRef(null);
  const refreshPromiseRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const bootstrappedRef = useRef(false);

  const isAuthenticated =
    phase === PHASE.AUTHENTICATED || phase === PHASE.PASSWORD_CHANGE_REQUIRED;

  /* ----------------------------------------------------------
     SESSION HELPERS
     ---------------------------------------------------------- */

  const persist = useCallback((session) => {
    sessionRef.current = session;
    writeSession(session);
  }, []);

  const clearSession = useCallback(() => {
    sessionRef.current = null;
    refreshPromiseRef.current = null;
    removeSession();

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (mountedRef.current) {
      setUser(null);
      setCpoContext(null);
      setIsRefreshing(false);
      setPhase(PHASE.UNAUTHENTICATED);
    }
  }, []);

  const getAccessToken = useCallback(() => sessionRef.current?.accessToken || null, []);

  /* Refresh 60s early so a request never rides an expiring token. */
  const accessTokenNeedsRefresh = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return false;
    if (!session.accessTokenExpiresAt) return true;
    return session.accessTokenExpiresAt - Date.now() <= 60_000;
  }, []);

  const sessionStillValid = useCallback(() => {
    const session = sessionRef.current;
    if (!session?.refreshToken) return false;
    if (!session.sessionExpiresAt) return true;
    return session.sessionExpiresAt > Date.now();
  }, []);

  /* ----------------------------------------------------------
     REFRESH — serialized
     ----------------------------------------------------------
     The refresh token is one-time. Two concurrent refreshes would
     replay a consumed token and kill the whole session, so every
     caller shares a single in-flight promise.
     ---------------------------------------------------------- */

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const current = sessionRef.current;

    if (!current?.refreshToken) {
      clearSession();
      return null;
    }

    const run = (async () => {
      if (mountedRef.current) setIsRefreshing(true);

      try {
        const response = await fetch(ENDPOINTS.refresh, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          /* No X-CPO-App-ID here: refresh uses the session's own
             tenant context and must not reselect it. */
          body: JSON.stringify({ refresh_token: current.refreshToken }),
        });

        const body = await readBody(response);

        if (!response.ok || !body?.access_token || !body?.refresh_token) {
          clearSession();
          return null;
        }

        /* Both tokens replaced together. */
        persist({
          ...sessionRef.current,
          ...sessionFromTokenResponse(body),
        });

        return body.access_token;
      } catch {
        /* Network blip: keep the stored session, let the caller retry. */
        return null;
      } finally {
        if (mountedRef.current) setIsRefreshing(false);
      }
    })();

    refreshPromiseRef.current = run;

    try {
      return await run;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, [clearSession, persist]);

  /* ----------------------------------------------------------
     CENTRAL AUTHENTICATED FETCH
     ----------------------------------------------------------
     Every protected call in the app should go through this, so
     bearer auth and App-ID context are attached in exactly one
     place and no screen can invent its own CPO context.
     ---------------------------------------------------------- */

  const buildHeaders = useCallback((token, options) => {
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    /* Only default to JSON if the caller didn't ask for something
       else — an SSE request needs Accept: text/event-stream and
       must not be overwritten here. */
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');

    if (CPO_APP_ID) headers.set('X-CPO-App-ID', CPO_APP_ID);

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  }, []);

  const authenticatedRequest = useCallback(
    async (url, options = {}) => {
      if (accessTokenNeedsRefresh()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) throw new ApiError('Session expired', { status: 401 });
      }

      let token = getAccessToken();
      if (!token) throw new ApiError('Not authenticated', { status: 401 });

      let response = await fetch(url, {
        ...options,
        headers: buildHeaders(token, options),
      });

      if (response.status !== 401) return response;

      /* A token can be rejected before its local expiry.
         Refresh once, retry once, then give up. */
      token = await refreshAccessToken();
      if (!token) throw new ApiError('Session expired', { status: 401 });

      response = await fetch(url, {
        ...options,
        headers: buildHeaders(token, options),
      });

      if (response.status === 401) {
        clearSession();
        throw new ApiError('Session expired', { status: 401 });
      }

      return response;
    },
    [
      accessTokenNeedsRefresh,
      buildHeaders,
      clearSession,
      getAccessToken,
      refreshAccessToken,
    ],
  );

  /* ----------------------------------------------------------
     /auth/me BOOTSTRAP
     ---------------------------------------------------------- */

  const loadIdentity = useCallback(async () => {
    const response = await authenticatedRequest(ENDPOINTS.me, { method: 'GET' });
    const body = await readBody(response);

    if (!response.ok || !body) {
      throw new ApiError(describeError(response.status, body), {
        status: response.status,
      });
    }

    const scope = body.scope || body.user?.scope;

    if (scope !== 'CPO') {
      throw new ApiError('This account cannot access the CPO console.', {
        status: 403,
      });
    }

    const returnedAppId = body.cpo_app_id || body.user?.cpo_app_id;

    if (CPO_APP_ID && returnedAppId && returnedAppId !== CPO_APP_ID) {
      throw new ApiError('Session belongs to a different CPO application.', {
        status: 403,
      });
    }

    const identity = {
      id: body.id || body.user_id || body.user?.id || '',
      email: body.email || body.user?.email || '',
      name:
        body.full_name ||
        body.name ||
        body.user?.full_name ||
        [body.first_name, body.last_name].filter(Boolean).join(' ') ||
        'User',
      role: body.role || body.user?.role || '',
      scope: 'CPO',
    };

    const context = {
      cpoId: body.cpo_id || body.user?.cpo_id || '',
      cpoName: body.cpo_name || body.cpo?.name || '',
      cpoAppId: returnedAppId || CPO_APP_ID,
      cpoAppIdMode: body.cpo_app_id_mode || sessionRef.current?.cpoAppIdMode || null,
    };

    const mustChangePassword = Boolean(
      body.must_change_password ?? sessionRef.current?.mustChangePassword,
    );

    persist({ ...sessionRef.current, mustChangePassword });

    if (mountedRef.current) {
      setUser(identity);
      setCpoContext(context);
      setPhase(
        mustChangePassword ? PHASE.PASSWORD_CHANGE_REQUIRED : PHASE.AUTHENTICATED,
      );
    }

    return { identity, context, mustChangePassword };
  }, [authenticatedRequest, persist]);

  /* ----------------------------------------------------------
     STARTUP — this is what keeps the user signed in
     ----------------------------------------------------------
     On every page load: read the stored session, refresh the
     access token if needed, then confirm with /auth/me. The app
     stays in BOOTSTRAPPING while this runs, so protected routes
     wait instead of bouncing the user to the login screen.
     ---------------------------------------------------------- */

  useEffect(() => {
    mountedRef.current = true;

    if (bootstrappedRef.current) return undefined;
    bootstrappedRef.current = true;

    (async () => {
      const stored = readSession();

      if (!stored) {
        removeSession();
        if (mountedRef.current) setPhase(PHASE.UNAUTHENTICATED);
        return;
      }

      sessionRef.current = stored;

      if (!sessionStillValid()) {
        clearSession();
        return;
      }

      try {
        if (accessTokenNeedsRefresh()) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) return; /* clearSession already ran */
        }

        await loadIdentity();
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          clearSession();
        } else if (mountedRef.current) {
          /* Backend unreachable. Keep the stored tokens — the user
             should not lose their session over a flaky network —
             but do not mount the app with unverified identity. */
          setPhase(PHASE.UNAUTHENTICATED);
        }
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [
    accessTokenNeedsRefresh,
    clearSession,
    loadIdentity,
    refreshAccessToken,
    sessionStillValid,
  ]);

  /* ----------------------------------------------------------
     PROACTIVE REFRESH TIMER
     ---------------------------------------------------------- */

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const schedule = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      const expiry = sessionRef.current?.accessTokenExpiresAt;
      if (!expiry) return;

      const delay = Math.max(expiry - Date.now() - 60_000, 5_000);

      refreshTimerRef.current = setTimeout(async () => {
        await refreshAccessToken();
        if (mountedRef.current) schedule();
      }, delay);
    };

    schedule();

    /* A tab that was asleep may wake up with an expired token. */
    const onWake = () => {
      if (document.visibilityState === 'visible' && accessTokenNeedsRefresh()) {
        refreshAccessToken();
      }
    };

    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('online', onWake);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('online', onWake);
    };
  }, [accessTokenNeedsRefresh, isAuthenticated, refreshAccessToken]);

  /* ----------------------------------------------------------
     CROSS-TAB SYNC
     ----------------------------------------------------------
     Sign out in one tab signs out everywhere; a refresh in one
     tab hands the rotated tokens to the others.
     ---------------------------------------------------------- */

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;

      if (!event.newValue) {
        sessionRef.current = null;
        if (mountedRef.current) {
          setUser(null);
          setCpoContext(null);
          setPhase(PHASE.UNAUTHENTICATED);
        }
        return;
      }

      try {
        sessionRef.current = JSON.parse(event.newValue);
      } catch {
        /* ignore malformed write */
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ----------------------------------------------------------
     LOGIN STEP 1 — email + password
     ---------------------------------------------------------- */

  const startLogin = useCallback(async ({ email, password }) => {
    if (!isAppIdConfigured()) {
      throw new ApiError(
        'This app is missing its CPO App ID configuration. Contact your administrator.',
        { status: 0 },
      );
    }

    const response = await fetch(ENDPOINTS.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-CPO-App-ID': CPO_APP_ID,
      },
      /* No cpo_id. The backend rejects unknown fields with 400. */
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        scope: 'CPO',
      }),
    });

    const body = await readBody(response);

    if (!response.ok || !body?.challenge_id) {
      throw new ApiError(describeError(response.status, body, GENERIC_LOGIN_FAILURE), {
        status: response.status,
        code: body?.code,
      });
    }

    return {
      challengeId: body.challenge_id,
      expiresAt: body.expires_at || null,
      resendAvailableAt: body.resend_available_at || null,
    };
  }, []);

  /* ----------------------------------------------------------
     LOGIN STEP 2 — verify the emailed code
     ---------------------------------------------------------- */

  const verifyOtp = useCallback(
    async ({ challengeId, code }) => {
      /* No App-ID header here: the challenge already carries the
         authoritative tenant context. */
      const response = await fetch(ENDPOINTS.verify2fa, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ challenge_id: challengeId, code }),
      });

      const body = await readBody(response);

      if (!response.ok || !body?.access_token || !body?.refresh_token) {
        throw new ApiError(
          describeError(response.status, body, 'That code did not work. Try again.'),
          { status: response.status, code: body?.code },
        );
      }

      persist(sessionFromTokenResponse(body));

      try {
        const { mustChangePassword } = await loadIdentity();
        return { mustChangePassword };
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession, loadIdentity, persist],
  );

  const resendOtp = useCallback(async ({ challengeId }) => {
    const response = await fetch(ENDPOINTS.resend2fa, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ challenge_id: challengeId }),
    });

    const body = await readBody(response);

    if (!response.ok || !body?.challenge_id) {
      throw new ApiError(
        describeError(response.status, body, 'Could not send a new code.'),
        { status: response.status, code: body?.code },
      );
    }

    /* The old challenge is now dead — replace the state wholesale. */
    return {
      challengeId: body.challenge_id,
      expiresAt: body.expires_at || null,
      resendAvailableAt: body.resend_available_at || null,
    };
  }, []);

  /* ----------------------------------------------------------
     PASSWORD CHANGE (authenticated)
     ---------------------------------------------------------- */

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      const response = await authenticatedRequest(ENDPOINTS.changePassword, {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const body = await readBody(response);
        throw new ApiError(
          describeError(response.status, body, 'Could not change the password.'),
          { status: response.status, code: body?.code },
        );
      }

      /* A successful change revokes every session, this one included. */
      clearSession();
      return true;
    },
    [authenticatedRequest, clearSession],
  );

  /* ----------------------------------------------------------
     SESSIONS + LOGOUT
     ---------------------------------------------------------- */

  const listSessions = useCallback(async () => {
    const response = await authenticatedRequest(ENDPOINTS.sessions, { method: 'GET' });
    const body = await readBody(response);

    if (!response.ok) {
      throw new ApiError(describeError(response.status, body), {
        status: response.status,
      });
    }

    return body?.sessions || body || [];
  }, [authenticatedRequest]);

  const revokeSession = useCallback(
    async (sessionId) => {
      const response = await authenticatedRequest(
        `${ENDPOINTS.sessions}/${encodeURIComponent(sessionId)}`,
        { method: 'DELETE' },
      );

      if (!response.ok && response.status !== 204) {
        const body = await readBody(response);
        throw new ApiError(describeError(response.status, body), {
          status: response.status,
        });
      }

      return true;
    },
    [authenticatedRequest],
  );

  const logout = useCallback(
    async ({ allSessions = false } = {}) => {
      try {
        await authenticatedRequest(
          allSessions ? ENDPOINTS.logoutAll : ENDPOINTS.logout,
          { method: 'POST' },
        );
      } catch {
        /* Local state is cleared either way. */
      } finally {
        clearSession();
      }
    },
    [authenticatedRequest, clearSession],
  );

  /* ---------------------------------------------------------- */

  /* ----------------------------------------------------------
     BACKWARD COMPATIBILITY
     ----------------------------------------------------------
     Screens written against the previous context keep working:
     they can go on using loading / login / refreshToken /
     isTokenExpired until they are migrated.
     ---------------------------------------------------------- */

  const legacyLogin = useCallback(
    (accessToken, refreshTokenValue, accessTokenExpiresAt, userInfo, sessionExpiresAt) => {
      if (!accessToken || !refreshTokenValue) return false;

      persist({
        accessToken,
        refreshToken: refreshTokenValue,
        accessTokenExpiresAt: toMillis(accessTokenExpiresAt),
        sessionExpiresAt: toMillis(sessionExpiresAt),
        cpoAppId: CPO_APP_ID,
        cpoAppIdMode: null,
        mustChangePassword: false,
      });

      if (userInfo) setUser(userInfo);
      setPhase(PHASE.AUTHENTICATED);

      return true;
    },
    [persist],
  );

  const getRefreshToken = useCallback(
    () => sessionRef.current?.refreshToken || null,
    [],
  );

  const value = useMemo(
    () => ({
      phase,
      isAuthenticated,
      isBootstrapping: phase === PHASE.BOOTSTRAPPING,
      mustChangePassword: phase === PHASE.PASSWORD_CHANGE_REQUIRED,
      isRefreshing,

      user,
      cpoContext,

      /* legacy aliases */
      loading: phase === PHASE.BOOTSTRAPPING,
      login: legacyLogin,
      refreshToken: refreshAccessToken,
      getRefreshToken,
      isTokenExpired: accessTokenNeedsRefresh,

      startLogin,
      verifyOtp,
      resendOtp,
      changePassword,
      logout,

      listSessions,
      revokeSession,

      authenticatedRequest,
      refreshAccessToken,
      reloadIdentity: loadIdentity,
      getAccessToken,
    }),
    [
      accessTokenNeedsRefresh,
      authenticatedRequest,
      changePassword,
      cpoContext,
      getAccessToken,
      getRefreshToken,
      isAuthenticated,
      legacyLogin,
      isRefreshing,
      listSessions,
      loadIdentity,
      logout,
      phase,
      refreshAccessToken,
      resendOtp,
      revokeSession,
      startLogin,
      user,
      verifyOtp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
