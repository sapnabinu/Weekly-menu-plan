

CREATE TABLE `GROCERY_LIST` (
  `USERID` varchar(30) NOT NULL,
  `MEAL_TIME` varchar(10) NOT NULL,
  `MEAL_TYPE` varchar(10) NOT NULL,
  `INGREDIENTS` varchar(20) DEFAULT NULL,
  `MEASUREMENT` varchar(30) DEFAULT NULL,
  `COST` int(10) DEFAULT NULL,
  PRIMARY KEY (`USERID`,`MEAL_TIME`,`MEAL_TYPE`)
) ;

CREATE TABLE `MEAL_INFO` (
  `MEAL_TIME` varchar(10) NOT NULL,
  `MEAL_TYPE` varchar(30) NOT NULL,
  `INGREDIENTS` varchar(30) NOT NULL,
  `MEASUREMENT` varchar(30) DEFAULT NULL,
  `COST` int(10) DEFAULT NULL,
  `DAIRY` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`MEAL_TIME`,`MEAL_TYPE`,`INGREDIENTS`),
  CONSTRAINT `meal_info_ibfk_1` FOREIGN KEY (`MEAL_TIME`) REFERENCES `MEAL_TIME` (`MEAL_TIME`)
) ;

CREATE TABLE `MEAL_TIME` (
  `MEAL_TIME` varchar(10) NOT NULL,
  PRIMARY KEY (`MEAL_TIME`)
) ;

CREATE TABLE `MEAL_TYPE` (
  `MEAL_TIME` varchar(10) NOT NULL,
  `MEAL_TYPE` varchar(30) NOT NULL,
  `CALORIES` int(10) DEFAULT NULL,
  `COST` int(10) DEFAULT NULL,
  `RECIPE` text,
  `NUTRITIONS` text,
  `TIME_TO_COOK` varchar(20) DEFAULT NULL,
  `PREP_TIME` varchar(20) DEFAULT NULL,
  `KIDS_MEAL` varchar(1) DEFAULT NULL,
  `VEGAN_MEAL` varchar(1) DEFAULT NULL,
  `LOW_CALORIE` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`MEAL_TIME`,`MEAL_TYPE`),
  CONSTRAINT `meal_type_ibfk_1` FOREIGN KEY (`MEAL_TIME`) REFERENCES `MEAL_TIME` (`MEAL_TIME`)
) ;

CREATE TABLE `USER_ACCOUNT` (
  `USERID` varchar(30) NOT NULL,
  `PASSWORD` varchar(30) DEFAULT NULL,
  `FIRST_NAME` varchar(30) DEFAULT NULL,
  `LAST_NAME` varchar(30) DEFAULT NULL,
  `EMAIL` varchar(30) DEFAULT NULL,
  `PHONE` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`USERID`)
) ;

CREATE TABLE `USER_SELECTION` (
  `USERID` varchar(30) NOT NULL,
  `MEAL_TIME` varchar(10) NOT NULL,
  `MEAL_TYPE` varchar(10) NOT NULL,
  `MEAL_DATE` date NOT NULL,
  `KIDS_MEAL` varchar(1) DEFAULT NULL,
  `VEGAN_MEAL` varchar(1) DEFAULT NULL,
  `LOW_CALORIE` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`USERID`,`MEAL_TIME`,`MEAL_TYPE`,`MEAL_DATE`)
) ;










