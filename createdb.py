#!/usr/bin/python

import sqlite3
import json

dbfile = "mealplanner.sqlite"

class MealDB():
    def __init__(self):
        self.conn = sqlite3.connect(dbfile)
        self.cursor = self.conn.cursor()
        self.createMealPlanTable()
        self.createRecipeTable()
        self.createUserTable()

    def createMealPlanTable(self):
        query = """CREATE TABLE IF NOT EXISTS MEAL_PLAN (
                USERID TEXT NOT NULL,
                MEAL_TIME TEXT,
                MEAL_DATE TEXT NOT NULL,
                RECIPE_NAME TEXT NOT NULL,
                PRIMARY KEY (USERID, MEAL_TIME, MEAL_DATE, RECIPE_NAME))"""
        self.cursor.execute(query)
        self.conn.commit()

    def createRecipeTable(self):
        query = """CREATE TABLE IF NOT EXISTS RECIPES (
           NAME TEXT NOT NULL,
           MEAL_TIME TEXT NOT NULL,
           CALORIES INT DEFAULT NULL,
           COST INT DEFAULT NULL,
           RECIPE TEXT,
           TIME_TO_COOK INT NOT NULL,
           PREP_TIME INT NOT NULL,
           KIDS_MEAL INT DEFAULT 0,
           VEGAN_MEAL INT DEFAULT 0,
           LOW_CALORIE INT DEFAULT 0,
           IMAGE TEXT DEFAULT NULL,
           PRIMARY KEY (`NAME`,`MEAL_TIME`))"""
        self.cursor.execute(query)
        self.conn.commit()

    def createUserTable(self):
        query = """CREATE TABLE IF NOT EXISTS USER_ACCOUNT ( 
                USERID text,
                PASSWORD text,
                FIRST_NAME text,
                LAST_NAME text,
                EMAIL text,
                PHONE text,
                PRIMARY KEY (EMAIL))"""
        self.cursor.execute(query)
        self.conn.commit()

    def createIngredientsTable(self):
        query = """CREATE TABLE IF NOT EXISTS INGREDIENTS (
                RECIPE_NAME text,
                INGREDIENT text,
                QUANTITY text,
                UNIT text )"""
        self.cursor.execute(query)
        self.conn.commit()
        
    def getPlan(self, startDate, endDate):
        query = "SELECT * FROM MEAL_PLAN WHERE MEAL_DATE BETWEEN ? AND ?"
        print query, startDate, endDate
        self.cursor.execute(query, [startDate, endDate])
        r = self.cursor.fetchall()
        print "getPlan:", r
        return r

    def addPlan(self, rows):
        query = """INSERT OR REPLACE INTO MEAL_PLAN (USERID,MEAL_TIME,MEAL_DATE,RECIPE_NAME)
                   VALUES(?,?,?,?)"""
        print "addPlan:", query, rows
        self.cursor.executemany(query,rows)
        self.conn.commit()

    def addUser(self, row):
        query = """INSERT OR REPLACE INTO USER_ACCOUNT
        (USERID,PASSWORD,FIRST_NAME,LAST_NAME,EMAIL,PHONE)
        VALUES(?,?,?,?,?,?)"""
        self.cursor.execute(query, row)
        self.conn.commit()

    def addRecipe(self, rows):
        query = """INSERT OR REPLACE INTO RECIPES (NAME,MEAL_TIME,CALORIES,COST,RECIPE,
           TIME_TO_COOK,PREP_TIME,KIDS_MEAL,VEGAN_MEAL,LOW_CALORIE,IMAGE)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)"""
        print self.cursor.executemany(query,rows)
        self.conn.commit()

    def getRecipe(self,mealTime):
        query = """SELECT * FROM RECIPES WHERE MEAL_TIME = ?"""
        self.cursor.execute(query, [mealTime])
        r = self.cursor.fetchall()
        print r
        return r

    def getPassword(self, user):
        query = """SELECT PASSWORD FROM USER_ACCOUNT WHERE EMAIL = ?"""
        self.cursor.execute(query,[user])
        r = self.cursor.fetchall()
        print r
        return r[0][0]

    def getIngredients(self,recipe):
        query = """SELECT * from INGREDIENTS WHERE RECIPE_NAME = ?"""
        self.cursor.execute(query)
        r = self.cursor.fetchall()
        print r
        return r

    def addIngredients(self,rows):
        query = """INSERT OR REPLACE INTO INGREDIENTS (
                RECIPE_NAME,INGREDIENT,QUANTITY,UNIT) VALUES (?,?,?,?)"""
        print "addIngredients:", query, rows
        self.cursor.execute(query, rows)
        self.conn.commit()

    def populateSampleData(self):
        sampleData = json.load(open("recipelist.json"))
        self.addRecipe(sampleData["recipes"])
        self.addUser(sampleData["users"])
        self.addIngredients(sampleData["ingredients"])

if __name__ == "__main__":
    m = MealDB()
    m.populateSampleData()
    print "BFST", m.getRecipe("BFST")
    print "LNCH", m.getRecipe("LNCH")
    print "DNNR", m.getRecipe("DNNR")
