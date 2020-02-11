export default class Pagination {
    skip: number;
    limit: number;
    total: number;

    constructor(skip?: number, limit?: number, maxLimit?: number) {
        if (!skip || isNaN(skip))
            skip = 0;
        if (!limit || isNaN(limit))
            limit = 10;
        if (maxLimit && isNaN(maxLimit) && limit > maxLimit)
            limit = maxLimit;

        this.skip = skip;
        this.limit = limit;
        this.total = 0;
    }
};
