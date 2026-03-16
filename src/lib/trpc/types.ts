import type { AppRouter } from '@/server/trpc/root';
import type { inferRouterOutputs, inferRouterInputs } from '@trpc/server';

/**
 * Type for all router outputs
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Type for all router inputs
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Auth router outputs
 */
export type AuthLoginOutput = RouterOutputs['auth']['login'];
export type AuthRegisterOutput = RouterOutputs['auth']['register'];

/**
 * User router outputs
 */
export type UserGetMeOutput = RouterOutputs['user']['getMe'];
export type UserGetUserOutput = RouterOutputs['user']['getUser'];
export type UserGetAllUsersOutput = RouterOutputs['user']['getAllUsers'];

/**
 * Auth router inputs
 */
export type AuthLoginInput = RouterInputs['auth']['login'];
export type AuthRegisterInput = RouterInputs['auth']['register'];
export type AuthForgotPasswordInput = RouterInputs['auth']['forgotPassword'];
export type AuthResetPasswordInput = RouterInputs['auth']['resetPassword'];

/**
 * User router inputs
 */
export type UserGetMeInput = RouterInputs['user']['getMe'];
export type UserUpdateMeInput = RouterInputs['user']['updateMe'];
export type UserUpdatePasswordInput = RouterInputs['user']['updatePassword'];
