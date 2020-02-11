import ClaimItem from './ClaimItem';

export default class ClaimView {
    name: string;
    items: ClaimItem[];

    constructor(name: string) {
        this.name = name;
        this.items = [];
    }
};
