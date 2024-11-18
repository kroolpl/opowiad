import { defineMiddleware } from "astro:middleware";
import type { NetlifyIdentityUser } from '@netlify/functions';

export const onRequest = defineMiddleware(async (context, next) => {
  const user = context.cookies.get('nf_jwt')?.value;

  // Add user to locals so it's available in all routes
  context.locals.user = user;

  // Protected routes
  if (context.url.pathname.startsWith('/admin')) {
    if (!user) {
      return context.redirect('/login');
    }
  }

  return next();
}); 