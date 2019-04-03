# What's this?
A part of the game "SimCity BuildIt" for Android and iOS consists in the creation of small objects. These objects depend on each other, creating a kind of a tree. I found it was a good use case for a graph database and decided to import game data in Neo4j. You will find in this repository the script needed to import game data in the database, and below some queries to play with these data.

You can find the game here https://play.google.com/store/apps/details?id=com.ea.game.simcitymobile_row for Android or here https://itunes.apple.com/us/app/simcity-buildit/id913292932?mt=8 for iOS.

# More details
These objects mentioned above are in fact "ingredients". These ingredients are built in different "buildings". There are basic ingredients (ingredients without any dependency) which are all built in building "Factory" and a lot of other "advanced" ingredients that depend on basic ingredients or on other advanced ingredients.

Examples below use ingredient "Fruit and berries". This ingredient is interesting because it depends on one basic ingredient and one advanced ingredient which it self depends on an other advanced ingredient. Moreover, it is also required for the creation of other more advanced ingredients.

Here are the direct dependencies of "Fruit and berries":
* 2 Seeds (basic ingredient)
* 1 Tree Saplings from "Gardening Supplies"

Second degree dependencies, for "Tree Saplings":
* 2 Seeds (basic ingredient)
* 1 Shovel from "Hardware Store"

Third degree dependencies, for "Shovel":
* 1 Metal (basic ingredient)
* 1 Wood (basic ingredient)
* 1 Plastic (basic ingredient)

After aggregation, here are the required basic ingredients for "Fruit and berries":
* 1 Plastic
* 1 Wood
* 1 Metal
* 4 Seeds

On the way up, here are the ingredients that need "Fruit and berries":
* Green Smoothie (1)
* Cherry Cheesecake (1)
* Frozen Yogurt (1)
* Lemonade Bottle (1)

# Neo4j queries
If you would like to try Neo4j by yourself, here is what you need:
* Install Neo4j (sample queries have been tested with Neo4j v2.3.1).
* Execute queries from file "src/main/resources/neo4j/data.txt" to load all ingredients.

If you need to reset the database:
* Execute queries from file "src/main/resources/neo4j/reset.txt"

## Queries
### Dependencies
Retrieve all ingredients that require "Fruit and berries", with the required quantity:
```
MATCH (i:Ingredient)-[r:NEED]->(:Ingredient {name:"Fruit and Berries"})
RETURN i.name as Ingredient, r.quantity as Quantity;
```

Retrieve all required ingredients and quantities to make "Fruit and berries":
```
MATCH (:Ingredient {name:"Fruit and Berries"})-[r:NEED]->(i:Ingredient)
RETURN i.name as Ingredient, r.quantity as Quantity;
```

Retrieve all basic ingredients required to build ingredient "Fruit and Berries":
```
MATCH (:Ingredient {name: "Fruit and Berries"})-[NEED*]->(i:Ingredient)
WHERE NOT (i)-[:NEED]->()
RETURN DISTINCT(i.name) as Ingredient;
```

Retrieving quantities of basic ingredients is a bit trickier. First retrieve all basic ingredients with their associated relations:
```
MATCH (:Ingredient {name: "Fruit and Berries"})-[r:NEED*]->(i:Ingredient)
WHERE NOT (i)-[:NEED]->()
RETURN i.name as Ingredient, r as Relations;
```

Then, aggregate quantities:
```
MATCH (:Ingredient {name: "Fruit and Berries"})-[r:NEED*]->(i:Ingredient)
WHERE NOT (i)-[:NEED]->()
RETURN i.name as Ingredient, REDUCE(quantities = 1, x IN r | quantities * x.quantity) as Quantity;
```

Finally sum all quantities per ingredient:
```
MATCH (:Ingredient {name: "Fruit and Berries"})-[r:NEED*]->(i:Ingredient)
WHERE NOT (i)-[:NEED]->()
RETURN i.name as Ingredient, SUM(REDUCE(quantities = 1, x IN r | quantities * x.quantity)) as Quantity;
```

### Dependencies with buildings
Now, buildings nodes can be used to show where ingredients are built.
Retrieve all ingredients that require "Fruit and berries", with the required quantity:
```
MATCH (b:Building)-[:BUILD]->(i:Ingredient)-[r:NEED]->(:Ingredient {name:"Fruit and Berries"})
RETURN b.name as Building, i.name as Ingredient, r.quantity as Quantity;
```

Retrieve all required ingredients and quantities to make "Fruit and berries":
```
MATCH (:Ingredient {name:"Fruit and Berries"})-[r:NEED]->(i:Ingredient)<-[:BUILD]-(b:Building)
RETURN i.name as Ingredient, r.quantity as Quantity, b.name as Building;
```

Retrieve all basic ingredients and quantities required to build ingredient "Fruit and Berries" (useless, as basic ingredients are all built in building "Factory"):
```
MATCH (:Ingredient {name: "Fruit and Berries"})-[r:NEED*]->(i:Ingredient)<-[:BUILD]-(b:Building)
WHERE NOT (i)-[:NEED]->()
RETURN b.name as Building, i.name as Ingredient, SUM(REDUCE(quantities = 1, x IN r | quantities * x.quantity)) as Quantity;
```

# Web application
For those who just want to try the web application, here is what you need:
* Java 11
* Maven

First, edit the file "src/main/resources/config.properties" to set the path where the Neo4j database will be saved (this must be an empty folder). You can then initialize the database:
```
mvn test -Dtest=InitDatabase
```

Finally, use the following command to launch the server:
```
mvn jetty:run
```
