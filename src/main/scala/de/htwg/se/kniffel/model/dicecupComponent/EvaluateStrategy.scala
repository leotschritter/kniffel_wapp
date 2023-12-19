package de.htwg.se.kniffel
package model.dicecupComponent

object EvaluateStrategy {
  type Type[Int] = List[Int] => Int

  private def getSum(data: List[Int], exp: Boolean): Int = if (exp) data.sum else 0

  private def mapToFrequency(data: List[Int]): List[Int] = data.map(x => data.count(_ == x))

  private def checkBigStreet(data: List[Int]) : Boolean = mapToFrequency(data).max == 1 & data.max - data.min == 4

  def threeOfAKind(data: List[Int]): Int = if (data.nonEmpty) getSum(data, mapToFrequency(data).max >= 3) else 0

  def fourOfAKind(data: List[Int]): Int = if (data.nonEmpty) getSum(data, mapToFrequency(data).max >= 4) else 0

  def fullHouse(data: List[Int]): Int = if (data.nonEmpty && (mapToFrequency(data).max == 3 & mapToFrequency(data).min == 2)) 25 else 0

  def bigStreet(data: List[Int]): Int = if (data.nonEmpty && (mapToFrequency(data).max == 1 & data.max - data.min == 4)) 40 else 0

  def smallStreet(data: List[Int]): Int = if (data.nonEmpty && (checkBigStreet(data) | data.distinct.size == 4 & data.distinct.max - data.distinct.min == 3 | data.distinct.sum.equals(19) | data.distinct.sum.equals(16))) 30 else 0

  def kniffel(data: List[Int]): Int = if (data.nonEmpty && mapToFrequency(data).max == 5) 50 else 0

  def sum(data: List[Int]): Int = data.sum

}