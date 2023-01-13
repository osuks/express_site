-- These are some Database Manipulation queries for a partially implemented Project Website
-- using the bsg database.
-- Your submission should contain ALL the queries required to implement ALL the
-- functionalities listed in the Project Specs.

-- Get ALL Customers and associated location data to populate customers page
SELECT C.CUS_FNAME, C.CUS_LNAME, C.CUS_ADDRESS,
       C2.CITY_NAME, S.ST_NAME, ZC.ZIP_CODE, C3.CTR_NAME
FROM Customers C
INNER JOIN Cities C2 ON C.CITY_ID = C2.CITY_ID
INNER JOIN States S ON C.ST_ID = S.ST_ID
INNER JOIN Countries C3 ON C.CTR_ID = C3.CTR_ID
INNER JOIN ZipCodes ZC ON C.ZIP_ID = ZC.ZIP_ID
ORDER BY CUS_ID ASC;

-- Get ALL restaurants and associated location data
SELECT R.RES_NAME, R.RES_ADDRESS, C.CITY_NAME, S.ST_NAME, ZC.ZIP_CODE, C2.CTR_NAME
FROM Restaurants R
INNER JOIN Cities C ON R.CITY_ID = C.CITY_ID
INNER JOIN States S ON R.ST_ID = S.ST_ID
INNER JOIN ZipCodes ZC ON R.ZIP_ID = ZC.ZIP_ID
INNER JOIN Countries C2 ON R.CTR_ID = C2.CTR_ID
ORDER BY RES_ID ASC;

-- Get a specific customer's reservations and the restaurant details
SELECT C.CUS_FNAME, C.CUS_LNAME, R2.RES_NAME,
       R2.RES_ADDRESS, C2.CITY_NAME AS RES_CITY, S.ST_NAME as RES_STATE, C3.CTR_NAME AS RES_COUNTRY, ZC.ZIP_CODE as
           RES_ZIP,
       R.REZ_DATETIME as REZ_DATETIME
FROM Reservations R
INNER JOIN Customers C ON R.CUS_ID = C.CUS_ID
INNER JOIN Restaurants R2 ON R.RES_ID = R2.RES_ID
INNER JOIN Cities C2 ON R2.CITY_ID = C2.CITY_ID
INNER JOIN States S ON R2.ST_ID = S.ST_ID
INNER JOIN Countries C3 ON R2.CTR_ID = C3.CTR_ID
INNER JOIN ZipCodes ZC ON R2.ZIP_ID = ZC.ZIP_ID
WHERE C.CUS_ID = :id_from_site:
ORDER BY REZ_DATETIME ASC;

-- Get Distinct location names for dropdowns
SELECT DISTINCT CITY_ID, CITY_NAME
FROM Cities
ORDER BY CITY_NAME ASC;

SELECT DISTINCT ST_ID, ST_NAME, ST_CODE
FROM States
ORDER BY ST_NAME ASC;

SELECT DISTINCT CTR_ID, CTR_CODE, CTR_NAME
FROM Countries
ORDER BY CTR_NAME ASC;

SELECT DISTINCT ZIP_ID, ZIP_CODE
FROM ZipCodes
ORDER BY ZIP_CODE ASC;

-- Lookup IDs of locations based on dropdown selection of Customer/Restaurant
SELECT CITY_ID
FROM Cities
WHERE CITY_NAME = :city:;

SELECT ST_ID
FROM States
WHERE ST_NAME = :state:;

SELECT CTR_ID
FROM Countries
WHERE CTR_NAME = :country:;

SELECT ZIP_ID
FROM ZipCodes
WHERE ZIP_ID = :zip:;

SELECT RES_ID
FROM Restaurants
INNER JOIN Cities C ON Restaurants.CITY_ID = C.CITY_ID
WHERE RES_NAME = :res_name:, C.CITY_NAME = :city_name:;

-- Inserts
INSERT INTO Customers (CUS_FNAME, CUS_LNAME, CUS_ADDRESS, CITY_ID, ST_ID, CTR_ID, ZIP_ID)
VALUES (:fname:, :lname:, :addr:, :city_id_lookup:, :state_id_lookup:, :ctr_id_lookup:, :zip_id_lookup:);

INSERT INTO Restaurants (RES_NAME, RES_ADDRESS, CITY_ID, ST_ID, CTR_ID, ZIP_ID)
VALUES (:resname:, :resaddr:, :city_id_lookup:, :state_id_lookup:, :ctr_id_lookup:, :zip_id_lookup:);

INSERT INTO Reservations (REZ_DATETIME, CUS_ID, RES_ID)
VALUES (:rez_dt:, :cus_id:, :res_id:);

-- Updates
UPDATE Customers SET CUS_FNAME = :fname:, CUS_LNAME = :lname:, CUS_ADDRESS = :addr:,
CUS_CITY_ID = :city_id_lookup:, CUS_ST_ID = :state_id_lookup:, CUS_CTR_ID = :ctr_id_lookup:, CUS_ZIP_ID = :zip_id_lookup:;

UPDATE Restaurants SET RES_NAME = :res_name:, RES_ADDRESS = :res_addr:,
CITY_ID = :city_id_lookup:, ST_ID = :state_id_lookup:, CTR_ID = :ctr_id_lookup:, ZIP_ID = :zip_id_lookup:
WHERE RES_ID = :res_id_lookup:;

-- delete a character
DELETE CASCADE FROM Reservations WHERE RES_ID = :res_id: and CUS_ID = :cus_id: and REZ_DATETIME = :rez_dt: