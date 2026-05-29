export class Destination {
  constructor(id, name, location, arrivalDate, departureDate, description, notes, tripId) {
    this.id = id;
    this.name = name;
    this.location = location;
    this.arrivalDate = arrivalDate;
    this.departureDate = departureDate;
    this.description = description;
    this.notes = notes;
    this.tripId = tripId;
  }
}
