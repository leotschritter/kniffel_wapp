package de.htwg.se.kniffel
package model.dicecupComponent

import play.api.libs.json.JsObject

import scala.collection.immutable.ListMap

trait IDiceCup {
  def nextRound(): IDiceCup

  def getInCup: List[Int]

  def getLocked: List[Int]

  def getRemainingDices: Int

  def getResult(index: Int): Int

  def putDicesIn(list: List[Int]): IDiceCup

  def putDicesOut(list: List[Int]): IDiceCup

  def dice(): IDiceCup

  def indexOfField: ListMap[String, Int]

  def isRunning: Boolean

  def toJson: JsObject
}
