
--
-- Table structure for table `Cities`
--

CREATE TABLE `Cities` (
  CITY_ID int(11) NOT NULL AUTO_INCREMENT,
  CITY_NAME varchar(255) NOT NULL,
  PRIMARY KEY (CITY_ID)
);

--
-- Dumping data for table Cities
--

INSERT INTO `Cities` (
  CITY_NAME
)
VALUES
(
  "Boston"
),
(
  "Los Angeles"
),
(
  "Seattle"
);

--
-- Table structure for table `States`
--

CREATE TABLE `States` (
  ST_ID int(11) NOT NULL AUTO_INCREMENT,
  ST_NAME varchar(255) NOT NULL,
  ST_CODE varchar(255) NOT NULL,
  PRIMARY KEY (ST_ID)
);

--
-- Dumping data for table States
--

INSERT INTO `States` (
  ST_NAME, ST_CODE
)
VALUES
(
  "Massachusetts",
  "MA"
),
(
  "California",
  "CA"
),
(
  "Washington",
  "WA"
);

--
-- Table structure for table `ZipCodes`
--

CREATE TABLE `ZipCodes` (
  ZIP_ID int(11) NOT NULL AUTO_INCREMENT,
  ZIP_CODE int(11) NOT NULL,
  PRIMARY KEY (ZIP_ID)
);

--
-- Dumping data for table ZipCodes
--

INSERT INTO `ZipCodes` (
  ZIP_CODE
)
VALUES
(
  12120
),
(
  90201
),
(
  98005
);

--
-- Table structure for table `Countries`
--

CREATE TABLE `Countries` (
  CTR_ID int(11) NOT NULL AUTO_INCREMENT,
  CTR_NAME varchar(255) NOT NULL,
  CTR_CODE varchar(255) NOT NULL,
  PRIMARY KEY (CTR_ID)
);

--
-- Dumping data for table Countries
--

INSERT INTO `Countries` (
  CTR_NAME,
  CTR_CODE
)
VALUES
(
  "United States of America",
  "USA"
),
(
  "Argentina",
  "ARG"
),
(
  "Canada",
  "CAN"
);

--
-- Table structure for table `Customers`
--

CREATE TABLE `Customers` (
  CUS_ID int(11) NOT NULL AUTO_INCREMENT,
  CUS_FNAME varchar(255) NOT NULL,
  CUS_LNAME varchar(255) NOT NULL,
  CUS_ADDRESS varchar(255) NOT NULL,
  CITY_ID int(11),
  ST_ID int(11),
  CTR_ID int(11),
  ZIP_ID int(11),
  PRIMARY KEY (CUS_ID),
  FOREIGN KEY (CITY_ID) REFERENCES Cities(City_ID),
  FOREIGN KEY (ST_ID) REFERENCES States(ST_ID),
  FOREIGN KEY (CTR_ID) REFERENCES Countries(CTR_ID),
  FOREIGN KEY (ZIP_ID) REFERENCES ZipCodes(ZIP_ID)
);

--
-- Dumping data for table Customers
--

INSERT INTO `Customers` (
CUS_FNAME,
CUS_LNAME,
CUS_ADDRESS,
 CITY_ID,
 ST_ID,
 CTR_ID,
 ZIP_ID
)
VALUES
(
  "John",
  "Miller",
 "4325 177th Ave",
 1,
 1,
 1,
 1
),
(
  "Smith",
  "Brown",
 "1400 Center St.",
 2,
 2,
 1,
 2
),
(
  "Paul",
  "Davis",
 "4465 South Circle Drive",
 3,
 3,
 1,
 3
);

--
-- Table structure for table `CreditCards`
--

CREATE TABLE `CreditCards` (
  CC_ID int(11) NOT NULL AUTO_INCREMENT,
  CUS_ID int(11) NOT NULL,
  CC_PIN_HASH varchar(255) NOT NULL,
  CC_NUMBER_HASH varchar(255) NOT NULL,
  CC_DEFAULT_CARD BIT NOT NULL,
  PRIMARY KEY (CC_ID),
  FOREIGN KEY (CUS_ID) REFERENCES Customers(CUS_ID)
);

--
-- Dumping data for table CreditCards
--

INSERT INTO `CreditCards` (
  CUS_ID,
  CC_PIN_HASH,
  CC_NUMBER_HASH,
  CC_DEFAULT_CARD
)
VALUES
(
  1,
  "69c9a5c19c5c27e43cb0efc4c8644ed6d03a110b",
  "69c9a5c19c5c27e43cb0efc4c8644ed6d03a7794",
  0
),
(
  2,
  "21x1a5x11x5x27e33xb0efx3x823ed2d03a1x0f",
  "21x1a5x11x5x27e33xb0efx3x823ed2d03b6372",
  1),
(
  3,
  "27q1a5e21x5r33e33xb0efx3x823ed2d03a990t",
  "27q1a5e21x5r33e33xb0efx3x823ed2d0387362",
  1
);

--
-- Table structure for table `Restaurants`
--

CREATE TABLE `Restaurants` (
  RES_ID int(11) NOT NULL AUTO_INCREMENT,
  RES_NAME varchar(255) NOT NULL,
  RES_ADDRESS varchar(255) NOT NULL,
  CITY_ID int(11) NOT NULL,
  ST_ID int(11) NOT NULL,
  CTR_ID int(11) NOT NULL,
  ZIP_ID int(11) NOT NULL,
  PRIMARY KEY (RES_ID),
  FOREIGN KEY (CITY_ID) REFERENCES Cities(City_ID),
  FOREIGN KEY (ST_ID) REFERENCES States(ST_ID),
  FOREIGN KEY (CTR_ID) REFERENCES Countries(CTR_ID),
  FOREIGN KEY (ZIP_ID) REFERENCES ZipCodes(ZIP_ID)
);

--
-- Dumping data for table Restaurants
--

INSERT INTO `Restaurants` (
  RES_NAME,
  RES_ADDRESS,
  CITY_ID,
  ST_ID,
  CTR_ID,
  ZIP_ID
)
VALUES
(
  "Cucina",
  "100 Main St",
  1,
  1,
  1,
  1
),
(
  "Izumi",
  "1200 Washington St",
  2,
  2,
  1,
  2
),
(
  "Applebee",
  "1400 Factoria Blvd",
  3,
  3,
  1,
  3
);

--
-- Table structure for table `Reservations`
--

CREATE TABLE `Reservations` (
  REZ_ID int(11) NOT NULL AUTO_INCREMENT,
  REZ_DATETIME DATETIME NOT NULL,
  CUS_ID int(11) NOT NULL,
  RES_ID int(11) NOT NULL,
  PRIMARY KEY (REZ_ID),
  FOREIGN KEY (CUS_ID) REFERENCES Customers(CUS_ID),
  FOREIGN KEY (RES_ID) REFERENCES Restaurants(RES_ID)
);

--
-- Dumping data for table Reservations
--

INSERT INTO `Reservations` (
  REZ_DATETIME,
  CUS_ID,
  RES_ID
)
VALUES
(
  CURRENT_DATE(),
  1,
  3
),
(
  CURRENT_DATE(),
  2,
  1
),
(
  CURRENT_DATE(),
  3,
  2
);

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
