import { ApplicationError } from '@/protocols';

export function forbiddenError(message: string): ApplicationError {
  const obj = {
    name: 'ForbiddenError',
    message: message,
  };
  
  return obj;
}
