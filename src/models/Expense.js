export class Expense {
  constructor(id, name, category, amount, date, description, tripId) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.amount = amount;
    this.date = date;
    this.description = description;
    this.tripId = tripId;
  }
}
