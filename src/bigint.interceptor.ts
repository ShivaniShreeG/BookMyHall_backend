// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class BigIntInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     return next.handle().pipe(
//       map((data) => {
//         function convert(obj: any): any {
//           if (typeof obj === 'bigint') return obj.toString();
//           if (Array.isArray(obj)) return obj.map(convert);
//           if (obj && typeof obj === 'object') {
//             const res: any = {};
//             for (const k in obj) res[k] = convert(obj[k]);
//             return res;
//           }
//           return obj;
//         }
//         return convert(data);
//       }),
//     );
//   }
// }
