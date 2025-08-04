export interface ExpressError extends Error {
  status?: number;
  stack?: string;
}

export interface ListQuery {
  page: number;
  size: number;
  sort?: string;
  order?: 'desc' | 'asc';
  keyword?: string;
}

// export interface Request {
//   user?: any; // You can replace `any` with a more specific type for your JWT payload
// }