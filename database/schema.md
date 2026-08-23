# FleetRent Database Schema

## 1. Driver

Stores driver account and personal information.

### Fields

- _id - ObjectId - Primary Key
- fullName - String
- mobileNumber - String - Unique
- email - String - Unique
- password - String
- drivingLicenseNumber - String - Unique
- address - String
- createdAt - Date
- updatedAt - Date


## 2. Business

Stores fleet/business owner account information.

### Fields

- _id - ObjectId - Primary Key
- fullName - String
- mobileNumber - String - Unique
- email - String - Unique
- password - String
- businessName - String
- fleetSize - Number
- city - String
- state - String
- createdAt - Date
- updatedAt - Date


## 3. Vehicle

Stores vehicles managed by businesses.

### Fields

- _id - ObjectId - Primary Key
- businessId - ObjectId - Foreign Key → Business
- registrationNumber - String - Unique
- engineNumber - String
- chassisNumber - String
- insuranceEndDate - Date
- pucEndDate - Date
- maintenanceDate - Date
- status - String
- createdAt - Date
- updatedAt - Date


## 4. Assignment

Connects drivers with vehicles and businesses.

### Fields

- _id - ObjectId - Primary Key
- driverId - ObjectId - Foreign Key → Driver
- vehicleId - ObjectId - Foreign Key → Vehicle
- businessId - ObjectId - Foreign Key → Business
- shift - String
- shiftStartTime - String
- shiftEndTime - String
- dailyRent - Number
- startDate - Date
- endDate - Date
- status - String
- createdAt - Date
- updatedAt - Date


## 5. Payment

Stores driver rent payment records.

### Fields

- _id - ObjectId - Primary Key
- assignmentId - ObjectId - Foreign Key → Assignment
- driverId - ObjectId - Foreign Key → Driver
- vehicleId - ObjectId - Foreign Key → Vehicle
- businessId - ObjectId - Foreign Key → Business
- amount - Number
- paymentMode - String
- transactionId - String
- paymentStatus - String
- paymentDate - Date
- createdAt - Date
- updatedAt - Date