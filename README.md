# Travel Planner

Web aplikacija za planiranje putovanja koja omogućava kreiranje planova putovanja, upravljanje destinacijama, aktivnostima, troškovima i checklistom, kao i deljenje planova sa drugim korisnicima.

## Tehnologije

* **Frontend:** React + Vite
* **Backend:** Microsoft Service Fabric (.NET 8)
* **Baza podataka:** SQL Server

## Preduslovi

Pre pokretanja aplikacije potrebno je instalirati:

* .NET 8 SDK
* Microsoft Service Fabric SDK
* SQL Server (LocalDB ili Express)
* Node.js 18+
* Visual Studio 2022

---

## Pokretanje backenda

### 1. Konfiguracija baze podataka

U `appsettings.json` fajlu svakog servisa podesiti connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=NazivBaze;Trusted_Connection=True;"
  }
}
```

### 2. Konfiguracija JWT autentifikacije

U `appsettings.json` fajlu svakog servisa postaviti iste JWT vrednosti:

```json
{
  "Jwt": {
    "Key": "vas-tajni-kljuc-od-najmanje-32-karaktera",
    "Issuer": "TravelPlanner",
    "Audience": "TravelPlannerClient"
  }
}
```

> **Napomena:** Svi servisi moraju koristiti isti `Jwt:Key` jer međusobno validiraju interne tokene.

### 3. Pokretanje migracija

Iz foldera `TravelPlanner.Backend` pokrenuti:

```bash
dotnet ef database update --project UserService

dotnet ef database update --project TravelService

dotnet ef database update --project ActivityService

dotnet ef database update --project PlanningService
```

### 4. Pokretanje sistema

Otvoriti rešenje u **Visual Studio 2022** i pokrenuti aplikaciju pritiskom na **F5**.

### Servisi

| Servis          | URL                   |
| --------------- | --------------------- |
| UserService     | http://localhost:5001 |
| TravelService   | http://localhost:5002 |
| ActivityService | http://localhost:5003 |
| PlanningService | http://localhost:5004 |

---

## Pokretanje frontenda

### 1. Instalacija zavisnosti

```bash
npm install
```

### 2. Kreiranje `.env` fajla

U root folderu frontend aplikacije kreirati `.env` fajl:

```env
VITE_USER_SERVICE_URL=http://localhost:5001
VITE_TRAVEL_SERVICE_URL=http://localhost:5002
VITE_ACTIVITY_SERVICE_URL=http://localhost:5003
VITE_PLANNING_SERVICE_URL=http://localhost:5004
```

### 3. Pokretanje aplikacije

```bash
npm run dev
```

Frontend će biti dostupan na:

```text
http://localhost:5173
```

---

## Arhitektura sistema

Sistem je organizovan kao skup mikroservisa:

* **UserService** – autentifikacija i upravljanje korisnicima
* **TravelService** – upravljanje putovanjima i destinacijama
* **ActivityService** – upravljanje aktivnostima tokom putovanja
* **PlanningService** – troškovi, checkliste i planiranje

Svi servisi komuniciraju preko Microsoft Service Fabric infrastrukture i koriste SQL Server za skladištenje podataka.
