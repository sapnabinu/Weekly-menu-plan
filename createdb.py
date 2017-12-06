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
        self.createIngredientMapTable()
        self.createIngredientsTable()

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

    def createIngredientMapTable(self):
        query = """CREATE TABLE IF NOT EXISTS INGREDIENT_MAP (
                INGREDIENT_ID INT,
                INGREDIENT_NAME text,
                UNIT text, PRIMARY KEY (INGREDIENT_ID, INGREDIENT_NAME))"""
        self.cursor.execute(query)
        self.conn.commit()

    def createIngredientsTable(self):
        query = """CREATE TABLE IF NOT EXISTS INGREDIENTS (
                RECIPE_NAME text,
                INGREDIENT_ID INT,
                QUANTITY text, PRIMARY KEY (RECIPE_NAME, INGREDIENT_ID))"""
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

    def addRecipe(self, row):
        query = """INSERT OR REPLACE INTO RECIPES (NAME,MEAL_TIME,CALORIES,COST,RECIPE,
           TIME_TO_COOK,PREP_TIME,KIDS_MEAL,VEGAN_MEAL,LOW_CALORIE,IMAGE)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)"""
        print self.cursor.execute(query,row)
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

    def getIngredients(self,recipes):
        query = """SELECT i.RECIPE_NAME, im.INGREDIENT_NAME, i.QUANTITY, im.UNIT
                FROM INGREDIENT_MAP AS im JOIN INGREDIENTS AS i ON im.INGREDIENT_ID = i.INGREDIENT_ID
                WHERE i.RECIPE_NAME IN ({})"""
        query = query.format( ",".join(['"{}"'.format(r) for r in recipes]))
        self.cursor.execute(query)
        r = self.cursor.fetchall()
        print r
        return r
    
    def addIngredientMap(self,rows):
        query = """INSERT OR REPLACE INTO INGREDIENT_MAP (
                INGREDIENT_ID, INGREDIENT_NAME, UNIT ) VALUES (?,?,?)"""
        self.cursor.executemany(query, rows)
        self.conn.commit()
    
    def addRecipeIngredients(self,rows):
        query = """INSERT OR REPLACE INTO INGREDIENTS (
                RECIPE_NAME,INGREDIENT_ID,QUANTITY) VALUES (?,?,?)"""
        print "addIngredients:", query, rows
        self.cursor.executemany(query, rows)
        self.conn.commit()

    def populateSampleData(self):
        sampleData = json.load(open("recipelist.json"))
        self.addRecipe(sampleData["recipes"])
        self.addUser(sampleData["users"])
        self.addIngredientMap(sampleData["ingredientmap"])
        self.addRecipeIngredients(sampleData["ingredients"])
        
    def getKidsMeals(self):
        query = "select * from recipes where kids_meal = 1"
        self.cursor.execute(query)
        r = self.cursor.fetchall()
        print r
        return r

if __name__ == "__main__":
    m = MealDB()
    m.populateSampleData()
    print "BFST", m.getRecipe("BFST")
    print "LNCH", m.getRecipe("LNCH")
    print "DNNR", m.getRecipe("DNNR")
