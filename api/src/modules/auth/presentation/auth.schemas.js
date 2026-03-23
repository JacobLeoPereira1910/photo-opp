import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email obrigatorio' })
    .trim()
    .email('Email invalido')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ required_error: 'Senha obrigatoria' })
    .min(1, 'Senha obrigatoria')
});

export const requestPasswordResetSchema = z.object({
  email: z
    .string({ required_error: 'Email obrigatorio' })
    .trim()
    .email('Email invalido')
    .transform((value) => value.toLowerCase())
});

export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email obrigatorio' })
    .trim()
    .email('Email invalido')
    .transform((value) => value.toLowerCase()),
  otp: z
    .string({ required_error: 'Codigo obrigatorio' })
    .length(4, 'Codigo deve ter 4 digitos')
    .regex(/^\d{4}$/, 'Codigo invalido')
});

export const resetPasswordSchema = z.object({
  resetToken: z.string({ required_error: 'Token obrigatorio' }).min(1),
  password: z
    .string({ required_error: 'Senha obrigatoria' })
    .min(6, 'Senha deve ter no minimo 6 caracteres')
});
