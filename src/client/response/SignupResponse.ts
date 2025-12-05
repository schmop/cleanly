/** @see {isSignupResponse} ts-auto-guard:type-guard */
export type SignupResponse = SignupSuccessResponse | SignupFailureResponse;

/** @see {isSignupSuccessResponse} ts-auto-guard:type-guard */
export interface SignupSuccessResponse {
    status: 'success',
    verification_required: boolean,
}

/** @see {isSignupFailureResponse} ts-auto-guard:type-guard */
export interface SignupFailureResponse {
    status: 'failure',
    reason?: string,
}
