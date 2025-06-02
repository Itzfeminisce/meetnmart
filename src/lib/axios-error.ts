import axios, { AxiosError } from 'axios';

// Define toast variant type
export type ToastVariant = 'default' | 'destructive';

// Import the error codes from the backend
export const ErrorCodes = {
    // System Errors
    NETWORK: 'ERR_NETWORK',
    TIMEOUT: 'ERR_TIMEOUT',
    SERVER: 'ERR_SERVER',
    UNKNOWN: 'ERR_UNKNOWN',

    // Authentication/Authorization Errors
    UNAUTHORIZED: 'ERR_UNAUTHORIZED',
    FORBIDDEN: 'ERR_FORBIDDEN',

    // Resource Errors
    NOT_FOUND: 'ERR_NOT_FOUND',
    BAD_REQUEST: 'ERR_BAD_REQUEST',
    DUPLICATE_ENTRY: 'ERR_DUPLICATE_ENTRY',
    FOREIGN_KEY_VIOLATION: 'ERR_FOREIGN_KEY_VIOLATION',
    VALIDATION: 'ERR_VALIDATION',

    // Transaction Errors
    TRANSACTION: 'ERR_TRANSACTION',
    DUPLICATE_TRANSACTION: 'ERR_DUPLICATE_TRANSACTION',
    INSUFFICIENT_FUNDS: 'ERR_INSUFFICIENT_FUNDS',
    PAYMENT_FAILED: 'ERR_PAYMENT_FAILED',
    TRANSACTION_EXPIRED: 'ERR_TRANSACTION_EXPIRED',
    TRANSACTION_CANCELLED: 'ERR_TRANSACTION_CANCELLED',
    TRANSACTION_PENDING: 'ERR_TRANSACTION_PENDING',
    TRANSACTION_VERIFICATION_FAILED: 'ERR_TRANSACTION_VERIFICATION_FAILED',
    TRANSACTION_NOT_FOUND: 'ERR_TRANSACTION_NOT_FOUND',

    // Subscription Errors
    SUBSCRIPTION_EXPIRED: 'ERR_SUBSCRIPTION_EXPIRED',
    SUBSCRIPTION_REQUIRED: 'ERR_SUBSCRIPTION_REQUIRED',
    SUBSCRIPTION_LIMIT_REACHED: 'ERR_SUBSCRIPTION_LIMIT_REACHED',
    SUBSCRIPTION_DOWNGRADE_FAILED: 'ERR_SUBSCRIPTION_DOWNGRADE_FAILED',
    SUBSCRIPTION_UPGRADE_FAILED: 'ERR_SUBSCRIPTION_UPGRADE_FAILED',
    SUBSCRIPTION_PAYMENT_FAILED: 'ERR_SUBSCRIPTION_PAYMENT_FAILED',
    SUBSCRIPTION_ALREADY_EXISTS: 'ERR_SUBSCRIPTION_ALREADY_EXISTS',
    SUBSCRIPTION_CANCELLATION_FAILED: 'ERR_SUBSCRIPTION_CANCELLATION_FAILED',
    SUBSCRIPTION_RENEWAL_FAILED: 'ERR_SUBSCRIPTION_RENEWAL_FAILED',
    SUBSCRIPTION_FEATURE_UNAVAILABLE: 'ERR_SUBSCRIPTION_FEATURE_UNAVAILABLE',
    SUBSCRIPTION_PLAN_NOT_FOUND: 'ERR_SUBSCRIPTION_PLAN_NOT_FOUND',
    SUBSCRIPTION_TIER_CHANGE_FAILED: 'ERR_SUBSCRIPTION_TIER_CHANGE_FAILED',
    SUBSCRIPTION_UPGRADE_REQUIRED: 'ERR_SUBSCRIPTION_UPGRADE_REQUIRED'
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Define the API response structure
interface ApiResponse<T = any> {
    status: 'success' | 'error' | 'pending';
    statusCode: number;
    message: string;
    data?: T;
    error?: {
        code: ErrorCode;
        details?: any;
    };
}

// Define the error response structure
export interface ErrorResponse {
    title: string;
    message: string;
    action?: string;
    details?: any;
    code: ErrorCode;
    statusCode: number;
    variant?: ToastVariant;
}

// Helper function to check if an error is an API error
export const isApiError = (error: any): error is AxiosError<ApiResponse> => {
    return error?.response?.data?.status === 'error';
};

// Helper function to get error details from the API response
export const getErrorDetails = (error: AxiosError<ApiResponse>): ErrorResponse => {
    const response = error.response?.data;
    return {
        title: getErrorTitle(response?.error?.code),
        message: response?.message || 'An unexpected error occurred',
        code: response?.error?.code || ErrorCodes.UNKNOWN,
        details: response?.error?.details,
        statusCode: response?.statusCode || 500,
        variant: "destructive", // getErrorVariant(response?.error?.code),
        action: getErrorAction(response?.error?.code)
    };
};


// Helper function to get error title based on error code
const getErrorTitle = (code?: ErrorCode): string => {
    switch (code) {
        // Authentication Errors
        case ErrorCodes.UNAUTHORIZED:
            return 'Authentication Required';
        case ErrorCodes.FORBIDDEN:
            return 'Access Denied';

        // Transaction Errors
        case ErrorCodes.INSUFFICIENT_FUNDS:
            return 'Insufficient Funds';
        case ErrorCodes.PAYMENT_FAILED:
            return 'Payment Failed';
        case ErrorCodes.DUPLICATE_TRANSACTION:
            return 'Duplicate Transaction';
        case ErrorCodes.TRANSACTION_EXPIRED:
            return 'Transaction Expired';
        case ErrorCodes.TRANSACTION_CANCELLED:
            return 'Transaction Cancelled';
        case ErrorCodes.TRANSACTION_PENDING:
            return 'Transaction Pending';
        case ErrorCodes.TRANSACTION_VERIFICATION_FAILED:
            return 'Verification Failed';
        case ErrorCodes.TRANSACTION_NOT_FOUND:
            return 'Transaction Not Found';

        // Resource Errors
        case ErrorCodes.NOT_FOUND:
            return 'Not Found';
        case ErrorCodes.DUPLICATE_ENTRY:
            return 'Duplicate Entry';
        case ErrorCodes.VALIDATION:
            return 'Validation Error';
        case ErrorCodes.FOREIGN_KEY_VIOLATION:
            return 'Invalid Reference';

        // System Errors
        case ErrorCodes.NETWORK:
            return 'Network Error';
        case ErrorCodes.TIMEOUT:
            return 'Request Timeout';
        case ErrorCodes.SERVER:
            return 'Server Error';

        // Subscription Errors
        case ErrorCodes.SUBSCRIPTION_EXPIRED:
            return 'Subscription Expired';
        case ErrorCodes.SUBSCRIPTION_REQUIRED:
            return 'Subscription Required';
        case ErrorCodes.SUBSCRIPTION_LIMIT_REACHED:
            return 'Subscription Limit Reached';
        case ErrorCodes.SUBSCRIPTION_DOWNGRADE_FAILED:
            return 'Subscription Downgrade Failed';
        case ErrorCodes.SUBSCRIPTION_UPGRADE_FAILED:
            return 'Subscription Upgrade Failed';
        case ErrorCodes.SUBSCRIPTION_PAYMENT_FAILED:
            return 'Subscription Payment Failed';
        case ErrorCodes.SUBSCRIPTION_ALREADY_EXISTS:
            return 'Subscription Already Exists';
        case ErrorCodes.SUBSCRIPTION_CANCELLATION_FAILED:
            return 'Subscription Cancellation Failed';
        case ErrorCodes.SUBSCRIPTION_RENEWAL_FAILED:
            return 'Subscription Renewal Failed';
        case ErrorCodes.SUBSCRIPTION_FEATURE_UNAVAILABLE:
            return 'Subscription Feature Unavailable';
        case ErrorCodes.SUBSCRIPTION_PLAN_NOT_FOUND:
            return 'Subscription Plan Not Found';
        case ErrorCodes.SUBSCRIPTION_TIER_CHANGE_FAILED:
            return 'Subscription Tier Change Failed';
        case ErrorCodes.SUBSCRIPTION_UPGRADE_REQUIRED:
            return 'Subscription Upgrade Required';


        default:
            return 'Error';
    }
};

// Helper function to get suggested action based on error code
const getErrorAction = (code?: ErrorCode): string => {
    switch (code) {
        // Authentication Actions
        case ErrorCodes.UNAUTHORIZED:
            return 'Please log in to continue';
        case ErrorCodes.FORBIDDEN:
            return 'Contact support if you need access';

        // Transaction Actions
        case ErrorCodes.INSUFFICIENT_FUNDS:
            return 'Add funds to continue';
        case ErrorCodes.PAYMENT_FAILED:
            return 'Try another payment method';
        case ErrorCodes.DUPLICATE_TRANSACTION:
            return 'Check your transaction history';
        case ErrorCodes.TRANSACTION_EXPIRED:
            return 'Please try the transaction again';
        case ErrorCodes.TRANSACTION_CANCELLED:
            return 'Start a new transaction';
        case ErrorCodes.TRANSACTION_PENDING:
            return 'Please wait while we process your transaction';
        case ErrorCodes.TRANSACTION_VERIFICATION_FAILED:
            return 'Contact support for assistance';
        case ErrorCodes.TRANSACTION_NOT_FOUND:
            return 'Check your transaction reference and try again';


        // Resource Actions
        case ErrorCodes.NOT_FOUND:
            return 'Please check the requested resource';
        case ErrorCodes.DUPLICATE_ENTRY:
            return 'Please use a different value';
        case ErrorCodes.VALIDATION:
            return 'Please check your input';

        // System Actions
        case ErrorCodes.NETWORK:
            return 'Check your internet connection';
        case ErrorCodes.TIMEOUT:
            return 'Please try again';
        case ErrorCodes.SERVER:
            return 'Try again later';

        // Subscription Actions
        case ErrorCodes.SUBSCRIPTION_EXPIRED:
            return 'Please renew your subscription';
        case ErrorCodes.SUBSCRIPTION_REQUIRED:
            return 'Please subscribe to continue';
        case ErrorCodes.SUBSCRIPTION_LIMIT_REACHED:
            return 'Please upgrade your subscription';
        case ErrorCodes.SUBSCRIPTION_DOWNGRADE_FAILED:
            return 'Please upgrade your subscription';
        case ErrorCodes.SUBSCRIPTION_UPGRADE_FAILED:
            return 'Please upgrade your subscription';
        case ErrorCodes.SUBSCRIPTION_PAYMENT_FAILED:
            return 'Please try another payment method';
        case ErrorCodes.SUBSCRIPTION_ALREADY_EXISTS:
            return 'Please cancel your existing subscription';
        case ErrorCodes.SUBSCRIPTION_CANCELLATION_FAILED:
            return 'Please try again';
        case ErrorCodes.SUBSCRIPTION_RENEWAL_FAILED:
            return 'Please try again';
        case ErrorCodes.SUBSCRIPTION_FEATURE_UNAVAILABLE:
            return 'Please upgrade your subscription';
        case ErrorCodes.SUBSCRIPTION_PLAN_NOT_FOUND:
            return 'Subscription Plan Not Found';
        case ErrorCodes.SUBSCRIPTION_UPGRADE_REQUIRED:
            return 'Please upgrade your subscription';
        case ErrorCodes.SUBSCRIPTION_TIER_CHANGE_FAILED:
            return 'Please try again';


        default:
            return 'Please try again or contact support';
    }
};

/**
 * Main error handler function that processes Axios errors
 * @param error - The error object from Axios
 * @returns Standardized error response
 */
export const handleAxiosError = (error: unknown): ErrorResponse => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;

        if (axiosError.response?.data) {
            const { error: apiError, message, statusCode } = axiosError.response.data;
            return {
                title: getErrorTitle(apiError?.code),
                message:  message || 'An unexpected error occurred',
                code: apiError?.code || ErrorCodes.UNKNOWN,
                details: apiError?.details,
                statusCode: statusCode,
                variant: "destructive", // getErrorVariant(apiError?.code),
                action: getErrorAction(apiError?.code)
            };
        }

        if (!axiosError.response) {
            return {
                title: 'Network Error',
                message: 'Unable to connect to the server',
                code: ErrorCodes.NETWORK,
                statusCode: 0,
                variant: 'destructive',
                action: 'Check your connection'
            };
        }
    }

    return {
        title: 'Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: ErrorCodes.UNKNOWN,
        statusCode: 500,
        variant: 'destructive',
        action: 'Try again'
    };
};
