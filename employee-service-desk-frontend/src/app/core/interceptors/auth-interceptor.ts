import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

const token =
localStorage.getItem('accessToken') ||
localStorage.getItem('token');

const isApiRequest =
req.url.startsWith('/api/') ||
req.url.startsWith('https://localhost:7293/api/');

if (token && isApiRequest) {
const authReq = req.clone({
setHeaders: {
Authorization: `Bearer ${token}`
}
});


return next(authReq);


}

return next(req);
};
