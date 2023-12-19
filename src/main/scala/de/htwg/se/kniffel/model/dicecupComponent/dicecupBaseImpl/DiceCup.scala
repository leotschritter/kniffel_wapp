package de.htwg.se.kniffel
package model.dicecupComponent.dicecupBaseImpl

import de.htwg.se.kniffel.model.dicecupComponent._
import play.api.libs.json.{JsNumber, JsObject, Json}

import scala.collection.immutable.ListMap

case class DiceCup(locked: List[Int], inCup: List[Int], remDices: Int) extends IDiceCup {
  def this() = this(List.fill(0)(0), List.fill(0)(0), 2)

  var state: DiceCupState = new Start()

  def dice(): DiceCup = state match {
    case start: Start => state = new Running; state.throwDices(this)
    case running: Running => state = new Running; state.throwDices(this)
  }

  def getRemainingDices: Int = remDices

  def getInCup: List[Int] = inCup

  def getLocked: List[Int] = locked

  def dropListEntriesFromList(entriesToDelete: List[Int], shortenedList: List[Int], n: Int = 0): List[Int] = {
    if (entriesToDelete.size != n)
      dropListEntriesFromList(entriesToDelete,
        shortenedList.take(shortenedList.lastIndexOf(entriesToDelete.apply(n)))
          ++ shortenedList.drop(shortenedList.lastIndexOf(entriesToDelete.apply(n)) + 1),
        n + 1)
    else
      shortenedList
  }

  def nextRound(): DiceCup = {
    state = new Start()
    state.throwDices(DiceCup(List.fill(0)(0), List.fill(0)(0), 2))
  }

  def listIsSubListOfList(inOrOut: List[Int], existingList: List[Int]): Boolean =
    existingList.length - inOrOut.length == dropListEntriesFromList(inOrOut, existingList).length

  def putDicesIn(sortIn: List[Int]): DiceCup = {
    if (listIsSubListOfList(sortIn, locked))
      DiceCup(dropListEntriesFromList(sortIn, locked), inCup ++ sortIn, remDices)
    else
      this
  }

  def putDicesOut(sortOut: List[Int]): DiceCup = {
    if (listIsSubListOfList(sortOut, inCup))
      DiceCup(sortOut ++ locked, dropListEntriesFromList(sortOut, inCup), remDices)
    else
      this
  }

  private def mergeLists(list1: List[Int], list2: List[Int]): List[Int] = list1 ::: list2

  def getResult(index: Int): Int = {
    val list: List[Int] = mergeLists(inCup, locked)
    index match {
      case 0 | 1 | 2 | 3 | 4 | 5 => list.filter(_ == index + 1).sum
      case 9 => new Evaluator(EvaluateStrategy.threeOfAKind).getResult(list)
      case 10 => new Evaluator(EvaluateStrategy.fourOfAKind).getResult(list)
      case 11 => new Evaluator(EvaluateStrategy.fullHouse).getResult(list)
      case 12 => new Evaluator(EvaluateStrategy.smallStreet).getResult(list)
      case 13 => new Evaluator(EvaluateStrategy.bigStreet).getResult(list)
      case 14 => new Evaluator(EvaluateStrategy.kniffel).getResult(list)
      case 15 => new Evaluator(EvaluateStrategy.sum).getResult(list)
      case _ => 0
    }
  }

  private def suggestionsUpperPart: ListMap[Int, Int] = {
    (9 to 15).map(n => n -> getResult(n)).to(ListMap)
  }

  private def suggestionsLowerPart: ListMap[Int, Int] = {
    (0 to 5).map(n => n -> getResult(n)).to(ListMap)
  }

  override def getSuggestions: ListMap[Int, Int] = {
    suggestionsUpperPart.concat(suggestionsLowerPart)
  }


  def indexOfField: ListMap[String, Int] =
    ListMap("1" -> 0, "2" -> 1, "3" -> 2, "4" -> 3, "5" -> 4, "6" -> 5,
      "3X" -> 9, "4X" -> 10, "FH" -> 11, "KS" -> 12, "GS" -> 13, "KN" -> 14, "CH" -> 15)

  override def toString: String = ("Im Becher: " + inCup.mkString(" ")
    + "\nRausgenommen: " + locked.mkString(" ")
    + "\nVerbleibende Würfe: " + (remDices + 1)
    + "\nBitte wählen Sie aus: " + indexOfField.keys.mkString(" ")
    + "\n")

  def isRunning: Boolean = getRemainingDices < 2

  override def toJson: JsObject = {
    Json.obj(
      "dicecup" -> Json.obj(
        "stored" -> this.getLocked,
        "incup" -> this.getInCup,
        "remainingDices" -> JsNumber(this.getRemainingDices)
      )
    )
  }
}