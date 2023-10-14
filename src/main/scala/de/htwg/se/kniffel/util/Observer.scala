package de.htwg.se.kniffel
package util

import de.htwg.se.kniffel.util.Event.Event

trait Observer {
  def update(e: Event): Unit
}

class Observable {
  var subscribers: Vector[Observer] = Vector()

  def add(s: Observer) = subscribers = subscribers :+ s

  def remove(s: Observer) = subscribers = subscribers.filterNot(o => o == s)

  def notifyObservers(e: Event) = subscribers.foreach(o => o.update(e))
}

object Event extends Enumeration {
  type Event = Value
  val Quit, Load, Save, Move = Value
}