# -*- coding: utf-8 -*-

# Script générant une couche et l'enregistrant au format GeoJson
# La couche générée contient des polygones qui sont des carrés
# Ces carrés font un degré de long, en projection WGS84
# La couche créée va être enregistrée dans le dossier "GeoJson"


# Ce script utilise des fonctions Qgis et se lance dessus


##################### Imports #####################

from qgis.PyQt.QtCore import QVariant
import numpy as np
import random
import os
import inspect


##################### Variables #####################


layer =  QgsVectorLayer('Polygon?epsg:4326','Carres',"memory") # Couche qui va contenir les polygones générés, nos carrés
pr = layer.dataProvider() # Provider



zone = np.array([(-18,35),(15,52)]) # Definition des la zone où les carrés vont se former en projection WGS84 (départ et arrivée)





##################### Découpage #####################

#Les carrés se construisent de la manière suivante


#   (i,j+1) ------- (i+1,j+1)
#     |                 | 
#     |                 |           
#     |                 |
#     |                 |
#   (i,j)  ---------  (i+1,j)           



# Calcul des différences en X et Y du point de départ de la zone avec le point d'arrivée
delta = zone[1]-zone[0]


largeur_zone =delta[1]
longueur_zone = delta[0]

carres = [] # Tableau qui va contenir les coordonnées des points pour chaque carrés, une ligne de ce tableau correspond a un carré
for i in range(longueur_zone+1):
    for j in range(largeur_zone+1):
        # Si on se situe sur un point a l'extremité de la zone on ne construit pas de carré
        if(i==longueur_zone or j==largeur_zone):
            pass
        else:
            # Les points du carré se construisent a partir du point de départ
            x = zone[0][0] + i
            y = zone[0][1] + j
            carres.append([[x,y],[x,y+1],[x+1,y+1],[x+1,y]]) # construction des points du carré selon le modèle établi




# Création des features correspondants aux carrés

for ligne in carres: # Parcours des lignes de la liste des coordonnées des carrés

    poly = QgsFeature() # Instanciation d'un geometrie, un carré

    points = [] # Tableau qui va contenir les points du carré, les points sont des objets QgsPoint

    for point in ligne: # Remplissage du tableau

        points.append(QgsPoint(point[0],point[1])) 

    poly.setGeometry(QgsGeometry.fromPolygon([points])) # Construction de la géométrie à partir des points

    pr.addFeatures([poly]) # Ajout de la géométrie au provider


##################### Ajouts des champs #####################

# Ajout des champs HYPOTHESE et ID sur chaque feature de la couche des carrés

champs = layer.dataProvider().addAttributes(
        [QgsField("ID", QVariant.Int),
        QgsField("HYPOTHESE", QVariant.Int)])
layer.updateFields() # Mise à jour des champs de la couche 

##################### Remplissage des champs #####################

#Remplissage des champs HYPOTHESE et ID
#Le champs HYPOTHESE se remplit aléatoirement avec une valeur entière comprise entre 0 et 30


idx = 0 # compteur servant pour la determination d'un ID pour chaque géométrie

for feature in layer.getFeatures(): # Parcours de chaque géométrie de la couche

    layer.startEditing() # Début de l'édition

    feature['HYPOTHESE'] = random.randint(0, 30) # Valeur aléatoire pour l'hypothèse

    feature['ID'] = idx
    idx +=1 # On incrémente pour avoir un ID différent 

    layer.updateFeature(feature) # Mise à jour des géométries


layer.commitChanges() # Confirmation les changement dans la couche
layer.updateExtents()

##################### Affichage sur la carte #####################
QgsMapLayerRegistry.instance().addMapLayers([layer])


##################### Export du fichier sorti au format GeoJson #####################

d = os.path.dirname(os.path.realpath(inspect.getframeinfo(inspect.currentframe()).filename)) # Emplacement du script

qgis.core.QgsVectorFileWriter.writeAsVectorFormat(layer, d +'/GeoJson/hypotheses.geojson', 'utf-8', layer.crs(), 'GeoJson') # Enregistrement de la couche
