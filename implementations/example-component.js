class ExampleElement extends HTMLElement {
  connectedCallback () {
    let renderTemplate = this.getAttribute('render');

    let t = document.querySelector(`#${renderTemplate}`);
    let clone = document.importNode(t.content, true);
    this.appendChild(clone);
  }    
}

customElements.define('peity-examples', ExampleElement);

// This is just an example where I alter properties of the graph via JavaScript
// and it is automatically redrawn.
function changeProperties (selector) {
  let interactiveGraph = document.querySelector(selector);
  
  interactiveGraph.data = [ 1/7, 6/7 ];
  interactiveGraph.fill = [ "red", "black", "blue" ];
  interactiveGraph.radius = 100;
}
