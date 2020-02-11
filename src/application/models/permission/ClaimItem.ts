export default class ClaimItem {
    code: number;
    name: string;

    constructor(data: ClaimItem) {
        this.code = data.code;
        this.name = data.name;
    }
};
