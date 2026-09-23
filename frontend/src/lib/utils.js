import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs) => twMerge(clsx(inputs));
export const asset = path => `${import.meta.env.BASE_URL}${path}`;
