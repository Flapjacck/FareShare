/**
 * Authentication Types
 * Type definitions for authentication-related data structures matching the backend API
 */

/**
 * User role enum matching backend UserRole
 */
export type UserRole = "user" | "admin";

/**
 * Account verification status matching backend VerificationStatus
 */
export type VerificationStatus = "pending" | "verified";

/**
 * Account status matching backend AccountStatus
 */
export type AccountStatus = "active" | "suspended";

/**
 * User registration data sent to POST /api/auth/register
 * Matches backend UserRegister schema
 */
export interface RegisterData {
    full_name: string;
    email: string;
    password: string;
}

/**
 * User login credentials sent to POST /api/auth/login
 * Matches backend UserLogin schema
 */
export interface LoginData {
    email: string;
    password: string;
}

/**
 * JWT token response from POST /api/auth/login
 * Matches backend Token schema
 */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number; // seconds until token expires
}

/**
 * Full user profile data received from the backend
 * Matches backend UserResponse schema
 */
export interface User {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    verification_status: VerificationStatus;
    status: AccountStatus;
    avatar_url: string | null;
    rating_avg: number;
    rating_count: number;
    created_at: string; // ISO datetime string

    // Vehicle information (optional - for drivers)
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: number | null;
    vehicle_color: string | null;
    vehicle_license_plate: string | null;
}

/**
 * Authentication context state
 * Used to manage global authentication state in the app
 */
export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
}

/**
 * API error response structure
 * Standard error format from backend
 */
export interface ApiError {
    detail: string;
    error_code?: string;
}
