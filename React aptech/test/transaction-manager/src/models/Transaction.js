export default class Transaction {
    constructor(id, description, type, amount) {
        this.id = id;
        this.description = description;
        this.type = type;
        this.amount = amount;
    }
}
