'use client';

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/auth';

interface AuthContextType {
	session: Session | null;
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	signOut: () => Promise<void>;
	signIn: (email: string, password: string, role: UserRole) => Promise<void>;
	signUp: (
		email: string,
		password: string,
		fullName: string,
		role: UserRole,
	) => Promise<{ session: Session | null; user: User | null }>;
	error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely clear corrupted auth tokens
function clearCorruptedAuthTokens() {
	if (typeof window === 'undefined') return;

	try {
		// Clear all localStorage keys that might contain Supabase auth data
		const keysToRemove = Object.keys(localStorage).filter(
			(key) =>
				key.includes('sb_') || key.includes('supabase') || key.includes('auth'),
		);
		keysToRemove.forEach((key) => {
			localStorage.removeItem(key);
		});
	} catch (err) {
		console.error('Error clearing auth tokens:', err);
	}
}

function setAuthHint(isAuthed: boolean) {
	if (typeof window === 'undefined') return;

	try {
		if (isAuthed) {
			localStorage.setItem('emineral_auth_hint', '1');
		} else {
			localStorage.removeItem('emineral_auth_hint');
		}
	} catch (err) {
		console.warn('Failed to update auth hint:', err);
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check current session
		const checkSession = async () => {
			try {
				const {
					data: { session: currentSession },
				} = await supabase.auth.getSession();
				setSession(currentSession);
				setUser(currentSession?.user ?? null);
				setAuthHint(!!currentSession?.user);
			} catch (err) {
				// Handle invalid refresh token error gracefully
				if (
					err instanceof Error &&
					err.message.includes('Refresh Token Not Found')
				) {
					console.warn('Refresh token invalid, clearing session');
					clearCorruptedAuthTokens();
					setSession(null);
					setUser(null);
					setAuthHint(false);
				} else {
					console.error('Session check failed:', err);
					setError('Failed to check session');
				}
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();

		// Subscribe to auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, currentSession) => {
			setSession(currentSession);
			setUser(currentSession?.user ?? null);
			setIsLoading(false);
			setAuthHint(!!currentSession?.user);

			// Handle token refresh
			if (event === 'TOKEN_REFRESHED') {
				console.log('Token refreshed successfully');
			}

			// Auto-logout on session expiry
			if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
				setSession(null);
				setUser(null);
				setAuthHint(false);
			}
		});

		// Check token expiry every minute
		const interval = setInterval(async () => {
			try {
				const {
					data: { session: currentSession },
				} = await supabase.auth.getSession();

				if (currentSession) {
					const expiresAt = currentSession.expires_at;
					if (expiresAt && Date.now() / 1000 >= expiresAt) {
						// Token expired, sign out
						await signOut();
					}
				}
			} catch (err) {
				// Silently handle token check errors
				if (
					err instanceof Error &&
					err.message.includes('Refresh Token Not Found')
				) {
					console.warn('Refresh token invalid during check, signing out');
					clearCorruptedAuthTokens();
					setSession(null);
					setUser(null);
					setAuthHint(false);
				}
			}
		}, 60000); // Check every 60 seconds

		return () => {
			subscription?.unsubscribe();
			clearInterval(interval);
		};
	}, []);

	const signIn = async (email: string, password: string, role: UserRole) => {
		try {
			setError(null);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;

			const { data: roleData } = await supabase
				.from('user_roles')
				.select('role')
				.eq('user_id', data.user.id)
				.single();

			const currentRole = (roleData as { role: string } | null)?.role;

			if (!currentRole) {
				await supabase.auth.signOut();
				throw new Error('Account role missing. Please contact support.');
			}

			if (currentRole !== role) {
				await supabase.auth.signOut();
				throw new Error(
					`This account is registered as a ${currentRole}.
			Please sign in using the correct role.`,
				);
			}

			// Immediately update state with the session data
			if (data.session) {
				setSession(data.session);
				setUser(data.session.user);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Sign in failed';
			setError(message);
			throw err;
		}
	};

	const signUp = async (
		email: string,
		password: string,
		fullName: string,
		role: UserRole,
	) => {
		try {
			setError(null);
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
						role,
					},
				},
			});
			if (error) throw error;

			// Immediately update state with the session data
			if (data.session) {
				setSession(data.session);
				setUser(data.session.user);
			}

			return {
				session: data.session ?? null,
				user: data.user ?? null,
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Sign up failed';
			setError(message);
			throw err;
		}
	};

	const signOut = async () => {
		try {
			setError(null);
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			// Ensure state is cleared
			setSession(null);
			setUser(null);
			setAuthHint(false);
		} catch (err) {
			// Even if signOut fails, clear local state to prevent stuck login
			setSession(null);
			setUser(null);
			setAuthHint(false);

			const message = err instanceof Error ? err.message : 'Sign out failed';

			// Don't throw if it's just a token issue - user should still be able to continue
			if (
				message.includes('Refresh Token Not Found') ||
				message.includes('Invalid Refresh Token')
			) {
				console.warn('Token already invalid, cleared local session');
			} else {
				setError(message);
				throw err;
			}
		}
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				user,
				isLoading,
				isAuthenticated: !!user,
				signOut,
				signIn,
				signUp,
				error,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
}
