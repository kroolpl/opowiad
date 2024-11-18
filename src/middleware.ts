import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('nf_jwt')?.value;

  // Add user to locals so it's available in all routes
  context.locals.user = token ? { id: token } : null;

  // Protected routes
  if (context.url.pathname.startsWith('/admin')) {
    if (!token) {
      return context.redirect('/login');
    }
  }

  return next();
}); 