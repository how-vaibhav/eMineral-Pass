// Auth types for eMineral Pass
export type UserRole = 'user' | 'host';

export interface UserProfile {
	id: string;
	email: string;
	full_name: string;
	role: UserRole;
	organization_name?: string;
	organization_license?: string;
	phone?: string;
	created_at: string;
	updated_at: string;
}

export interface SignUpFormData {
	email: string;
	password: string;
	full_name: string;
	confirmPassword: string;
	role: UserRole;
	organizationName?: string;
	organizationLicense?: string;
}

export interface SignInFormData {
	email: string;
	password: string;
	role: UserRole;
}
