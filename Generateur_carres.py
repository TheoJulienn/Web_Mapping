# -*- coding: utf-8 -*-


from qgis.PyQt.QtCore import QVariant
import numpy as np
import random



#Variables

#couche qui va contenir les polygons créés
layer =  QgsVectorLayer('Polygon?epsg:4326','Carres',"memory")
pr = layer.dataProvider()

#definition des la zone où les carrés vont se former, en projection WGS84 (départ et arrivée)

zone = np.array([(-2,30),(3,49  )])

#decoupage de cette zone carrée en sous carrée de longueur 1 degré

#calcul de deltax et deltay pour savoir combien de carres vont etre construits
delta = zone[1]-zone[0]


largeur_zone =delta[1]
longueur_zone = delta[0]
carres = []#liste de coordonnées de points pour chaque carrés, une ligne correspond a un carré
for i in range(longueur_zone+1):
    for j in range(largeur_zone+1):
        if(i==longueur_zone or j==largeur_zone):
            pass
        else:
            x = zone[0][0] + i
            y = zone[0][1] + j
            carres.append([[x,y],[x,y+1],[x+1,y+1],[x+1,y]])

#création des carrés sur qgis et ajout a la couche
for ligne in carres:
    poly = QgsFeature()
    points = []
    for point in ligne:
        points.append(QgsPoint(point[0],point[1]))

    poly.setGeometry(QgsGeometry.fromPolygon([points]))
    pr.addFeatures([poly])


#Ajout du champs hypothèse et ID

champs = layer.dataProvider().addAttributes(
        [QgsField("ID", QVariant.Int),
        QgsField("HYPOTHESE", QVariant.Int)])
layer.updateFields()

#Ajout des hypothèses dans le champs et du champs ID
idx = 0
for feature in layer.getFeatures():
    layer.startEditing()
    feature['HYPOTHESE'] = random.randint(0, 30)
    feature['ID'] = idx
    idx +=1
    layer.updateFeature(feature)

#Confimer les changement dans la couche
layer.commitChanges()


layer.updateExtents()
QgsMapLayerRegistry.instance().addMapLayers([layer])#ajout de la couche a la carte
qgis.core.QgsVectorFileWriter.writeAsVectorFormat(layer,'D:/Cours/Web_Mapping/hypotheses.geojson', 'utf-8', layer.crs(), 'GeoJson')#enregistrement de la couche
