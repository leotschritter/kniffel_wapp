package de.htwg.se.kniffel

import aview.{ GUI, TUI }
import Config._

object Kniffel {
  def main(args: Array[String]): Unit = {
    println("Welcome to Kniffel")
    val tui = new TUI()
    val gui = new GUI()
    tui.run()
  }
}
