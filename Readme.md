## Installation

1. Install [live-server](https://github.com/tapio/live-server) (or your favorite popup development web server).
1. bower install

## Running

Run "live-server" from the root directory. It should pop open the index.html page in your default browser ready for you to look at the plain JavaScript example components and the Polymer rewrites of those same components.

## The complete component catalog

Eventually I want to have a complete catalog of examples, beyond the rewrite of Peity graphs which cover a really common set of component recipies. Here's the list I intend to add. Probably each one will get both plain JS and Polymer implementations.

* HTML Only
  * Component simply renders a larger block of HTML.
* HTML + CSS
    * Rendering HTML and including CSS for that HTML (via Shadow DOM, embedded &lt;style&gt; block, JavaScript CSS, etc.).
* String Attributes
    * A component which utilizes the string values of attributes set in the DOM on the component.
* Boolean, Object, Array, and Other Attribute Types
   * Very similar to the previous but demonstrating dealing with attributes which will always have a specific type of value.
* Code in the Component
   * Conditionally generating HTML from within the component.
* Wrapping Inner HTML or Text
   * Utilizing the contents of the element in the output from the component. For example, <big>Bartleby</big> making use of "Bartleby" rather than just discarding it.
* HTML from an External File
   * The HTML to render must come from a file other than the one from which the component came.
* Exposing Events
   * Input to components is via attributes (and properties/functions if you're dealing with them from JavaScript) but output from them is via events. Expose some events and tie the parent to them.
* Interacting with Another Component
* One Component Using Another Component
* Changing Class or Style
* Repeating Elements
* Connecting to a Redux Model
* Unit Testing Examples
   * Demonstrate testing several different aspects to a component like those above. Especially, it's output to the DOM and interacting with it via JavaScript after it's instantiated.

## To Do List
* Make the line chart work
* Build out more of the basic component catalog items
