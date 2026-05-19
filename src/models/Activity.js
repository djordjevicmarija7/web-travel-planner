export class Activity{
    constructor(id, name, date, time, location, description, estimatedCost, status, tripId){
        this.id = id;
        this.name = name;
        this.date = date;
        this.time = time;
        this.location = location;
        this.description = description;
        this.estimatedCost = estimatedCost;
        this.status = status;
        this.tripId = tripId;
    }

}