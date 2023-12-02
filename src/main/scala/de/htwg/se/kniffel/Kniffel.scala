package de.htwg.se.kniffel

import com.google.inject.{Guice, Injector}
import de.htwg.se.kniffel.aview.{GUI, TUI}
import de.htwg.se.kniffel.controller.IController
object Kniffel {

  private val injector: Injector = Guice.createInjector(new KniffelModule)
  val controller: IController = injector.getInstance(classOf[IController])
  private val tui = injector.getInstance(classOf[TUI])

  def main(args: Array[String]): Unit = {
    injector.getInstance(classOf[GUI])
    println("Welcome to Kniffel")
    tui.run()
  }
}