#!/usr/bin/python

import sqlite3
import json

dbfile = "mealplanner.sqlite"
mealPlanTable = "MEAL_PLAN"
recipeTable = "RECIPES"

class MealDB():
    def __init__(self):
        self.conn = sqlite3.connect(dbfile)
        self.cursor = self.conn.cursor()
        self.createMealPlanTable()
        self.createRecipeTable()

    def createMealPlanTable(self):
        query = """CREATE TABLE IF NOT EXISTS {} (
                USERID TEXT NOT NULL,
                MEAL_TIME TEXT,
                MEAL_DATE TEXT NOT NULL,
                RECIPE_NAME TEXT NOT NULL,
                PRIMARY KEY (USERID, MEAL_TIME, MEAL_DATE, RECIPE_NAME))""".format( mealPlanTable )
        self.cursor.execute(query)
        self.conn.commit()

    def createRecipeTable(self):
        query = """CREATE TABLE IF NOT EXISTS {} (
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
           IMAGE BLOB DEFAULT NULL,
           PRIMARY KEY (`NAME`,`MEAL_TIME`))""".format(recipeTable)
        self.cursor.execute(query)
        self.conn.commit()

    def findPlan(self, startDate, endDate):
        query = "SELECT * FROM {} WHERE MEAL_DATE BETWEEN {} AND {}".format(
            mealPlanTable, startDate, endDate )
        self.cursor.execute(query)
        return self.cursor.fetchall()

    def addPlan(self, rows):
        query = """INSERT OR REPLACE INTO {} (USERID,MEAL_TIME,MEAL_DATE,RECIPE_NAME)
                   VALUES(?,?,?,?)""".format(mealPlanTable)
        self.cursor.executemany(query,rows)
        self.conn.commit()

    def addRecipe(self, rows):
        query = """INSERT INTO {} (NAME,MEAL_TIME,CALORIES,COST,RECIPE,
           TIME_TO_COOK,PREP_TIME,KIDS_MEAL,VEGAN_MEAL,LOW_CALORIE,IMAGE)
           VALUES(?,?,?,?,?,?,?,?,?,?,?)""".format(recipeTable)
        print self.cursor.executemany(query,rows)
        self.conn.commit()

    def getRecipe(self,mealTime):
        query="SELECT NAME,RECIPE,IMAGE FROM {} WHERE MEAL_TIME = ?".format(recipeTable)
        self.cursor.execute(query, [mealTime])
        return self.cursor.fetchall()

    def populateSampleData(self):
        recipeList = json.load(open("recipelist.json"))["recipes"]
        self.addRecipe(recipeList)

if __name__ == "__main__":
    m = MealDB()
    # m.populateSampleData()
    print "BFST", json.dumps(m.getRecipe("BFST"))
    print "LNCH", m.getRecipe("LNCH")
    print "DNNR", m.getRecipe("DNNR")
    
