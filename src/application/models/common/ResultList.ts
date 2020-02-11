import Pagination from './Pagination';

export default class ResultList<T> {
    pagination: Pagination;
    results: T[]

    constructor(skip?: number, limit?: number, maxLimit?: number) {
        this.pagination = new Pagination(skip, limit, maxLimit);
        this.results = [];
    }
};
