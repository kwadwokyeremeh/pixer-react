export class Paginator<T> {
  data: T[];
  count: number;
  current_page: number;
  first_item: number;
  last_item: number;
  last_page: number;
  per_page: number;
  total: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string;
  prev_page_url: string;
}
