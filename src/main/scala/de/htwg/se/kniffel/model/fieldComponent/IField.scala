package de.htwg.se.kniffel
package model.fieldComponent

import play.api.libs.json.JsObject

trait IField {
  def putMulti(valueList: List[String], putInValue: String, x: Int, y: Int): IField

  def undoMove(valueList: List[String], x: Int, y: Int): IField

  def numberOfPlayers: Int

  def getMatrix: IMatrix

  def getRows: Vector[Vector[String]]

  def getFirstColumn: List[String]

  def toJson: JsObject
}

trait IMatrix {
  def cell(col: Int, row: Int): String

  def isEmpty(col: Int, row: Int): Boolean
}