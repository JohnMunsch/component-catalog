class BaseElement extends HTMLElement {
  constructor () {
    super();
    
    this.options = {
      data: [],
      delimiter: null,
      fill: ['#ff9900', '#fff4dd', "#ffd592"],
      height: null,
      width: null
    };
  }

  camelCase (name) {
    return name.replace(/-([a-z])/g, function (g) { 
      return g[1].toUpperCase();
    });
  }
  
  attributeChangedCallback(attrName, oldVal, newVal) {
    // TODO: This code needs something to tell us when we're getting a direct property change vs an attribute change. Property changes
    // should be reflected back to the attributes.

    this[this.camelCase(attrName)] = newVal;
  }

  getAttr(name, defaultVal) {
    let currentVal = this.options[name];
    
    return (currentVal !== null && currentVal !== undefined) ? this.options[name] : defaultVal;
  }
  
  setAttr(name, newVal, type = 'string') {
    if (newVal == undefined) {
      return;
    }

    // TODO: If we're not coming from an attribute change, reflect this back to the attribute.

    if (typeof newVal !== type) {
      switch (type) {
        case 'number':
          newVal = parseFloat(newVal, 10);
          break;
      }
    }

    this.options[name] = newVal;
   
    // We're changing values on the chart, we should redraw the chart.
    this.render();
  }
  
  get shadowRoot () {
    if (!this._shadowRoot) {
      this._shadowRoot = this.attachShadow({mode: 'open'});
    }
    
    return this._shadowRoot;
  }
  
  get data () {
    return this.options.data;
  }
  
  set data (newVal) {
    // Process the data to get an array of numbers. There may be two items 
    // or many.
    if (typeof newVal == 'string') {
      let temp = newVal.split(this.delimiter).map(val => parseFloat(val, 10));

      // If that didn't result in multiple values, parse again using /
      // as our delimiter and expect only two values.
      if (temp.length === 1) {
        temp = newVal.split('/');
        
        // Create an array with two values. For example, if our two values were
        // "1/7", then we create an array with [ 1/7, 6/7 ]. That gives us two
        // data parts which make up a very simple pie or donut chart.
        if (temp.length === 2) {
          this.options.data = [ temp[0] / temp[1], (temp[1] - temp[0]) / temp[1] ];
        }
      } else {
        this.options.data = temp;
      }
    } else {
      this.options.data = newVal;
    }
    
    this.render();
  }
  
  // By default we expect comma delimiters.
  get delimiter () {
    return this.getAttr('delimiter', ',');
  }
  
  set delimiter (newVal) {
    this.setAttr('delimiter', newVal);
  }
  
  get fill () {
    return this.options.fill;
  }
  
  set fill (newVal) {
    if (Array.isArray(newVal)) {
      this.options.fill = newVal;
    } else {
      this.options.fill = JSON.parse(newVal);
    }
    
    this.render();
  }
  
  get width () {
    return this.getAttr('width', 16);
  }
  
  set width (newVal) {
    this.setAttr('width', newVal, 'number');
  }

  get height () {
    return this.getAttr('height', 16);
  }
  
  set height (newVal) {
    this.setAttr('height', newVal, 'number');
  }
  
  connectedCallback () {
    // Get the data we'll use for the chart.
    this.data = this.innerText;
  }
}

class PieElement extends BaseElement {
  constructor () {
    super();
    
    Object.assign(this.options, this.options, {
      radius: 8,
    });
  }
  
  static get observedAttributes () {
    return [
      'delimiter',
      'fill',
      'height',
      'radius',
      'width'
    ];
  }

  // Even though the pie charts don't use it, the donut charts do, and there's
  // only one set of code which powers both.
  get innerRadius () {
    return 0;
  }

  get radius () {
    return this.getAttr('radius', 8);
  }
  
  set radius (newVal) {
    this.setAttr('radius', newVal, 'number');
  }
  
  get width () {
    return this.getAttr('width', this.radius * 2);
  }
  
  set width (newVal) {
    super.width = newVal;
  }
  
  get height () {
    return this.getAttr('height', this.radius * 2);
  }

  set height (newVal) {
    super.height = newVal;
  }
  
  render () {
    if (this.data.length) {
      this.shadowRoot.innerHTML = `<svg width="${this.width}" height="${this.height}"></svg>`;

      let svg = d3.select(this.shadowRoot).select('svg'),
        g = svg.append('g').attr('transform', `translate(${this.radius},${this.radius})`);

      var pie = d3.pie().sort(null);

      var path = d3.arc()
          .outerRadius(this.radius)
          .innerRadius(this.innerRadius);

      let data = this.data;

      var color = d3.scaleLinear().domain([0, data.length - 1])
                    .range(this.fill);

      // Selects all the arcs in the graph and syncs them up with
      // the data for the various slices.
      var arc = g.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

      arc.append('path')
          .attr('d', path)
          .attr('fill', function(d) { return color(d.index); });
    }
  }
}

class DonutElement extends PieElement {
  constructor () {
    super();

    Object.assign(this.options, this.options, {
      innerRadius: null
    });
  }

  static get observedAttributes () {
    return [
      'delimiter',
      'fill',
      'height',
      'radius',
      'width',
      'inner-radius'
    ];
  }

  get innerRadius () {
    return this.getAttr('innerRadius', this.radius / 2);
  }
  
  set innerRadius (newVal) {
    this.setAttr('innerRadius', newVal, 'number');
  }
}

// As with the pie and donut simply being to variations of the same custom
// element, there's a good chance these two will lead to only one 
// implementation.
class LineElement extends BaseElement {
  constructor () {
    super();

    // Add additional options only appropriate for this type of graph (or any
    // direct children). Also, override values at this point.
    Object.assign(this.options, this.options, {
      delimiter: ",",
      fill: ["#c6d9fd"],
      height: 16,
      max: null,
      min: 0,
      stroke: "#4d89f9",
      strokeWidth: 1,
      width: 32
    });
  }
  
  static get observedAttributes () {
    return [
      'delimiter',
      'fill',
      'height',
      'max',
      'min',
      'stroke',
      'strokeWidth',
      'width'
    ];
  }
  
  get max () {
    return this.getAttr('max');
  }
  
  set max (newVal) {
    this.setAttr('max', newVal);
  }

  get min () {
    return this.getAttr('min');
  }
  
  set min (newVal) {
    this.setAttr('min', newVal);
  }
  
  get stroke () {
    return this.getAttr('stroke');
  }
  
  set stroke (newVal) {
    this.setAttr('stroke', newVal);
  }
  
  get strokeWidth () {
    return this.getAttr('strokeWidth');
  }
  
  set strokeWidth (newVal) {
    this.setAttr('strokeWidth', newVal);
  }

  render () {
    if (this.data.length) {
      this.innerHTML = `<svg width="${this.width}" height="${this.height}"></svg>`;

      d3.select(this).select('svg');

      // this.innerHTML = `<svg class="peity" height="16" width="32">
      //                     <polygon fill="#c6d9fd" points="0 15.5 0 7.166666666666666 3.5555555555555554 10.5 7.111111111111111 0.5 10.666666666666666 5.5 14.222222222222221 7.166666666666666 17.77777777777778 0.5 21.333333333333332 3.833333333333334 24.888888888888886 10.5 28.444444444444443 7.166666666666666 32 12.166666666666668 32 15.5"></polygon>
      //                     <polyline fill="none" points="0 7.166666666666666 3.5555555555555554 10.5 7.111111111111111 0.5 10.666666666666666 5.5 14.222222222222221 7.166666666666666 17.77777777777778 0.5 21.333333333333332 3.833333333333334 24.888888888888886 10.5 28.444444444444443 7.166666666666666 32 12.166666666666668" stroke="#4d89f9" stroke-width="1" stroke-linecap="square"></polyline>
      //                   </svg>`;
    }
  }
}

class BarElement extends BaseElement {
  constructor () {
    super();

    // Add additional options only appropriate for this type of graph (or any
    // direct children). Also, override values at this point.
    Object.assign(this.options, this.options, {
      delimiter: ",",
      fill: ["#4d89f9"],
      height: 16,
      max: null,
      min: 0,
      padding: 0.1,
      width: 32
    });
  }

  static get observedAttributes () {
    return [
      'delimiter',
      'fill',
      'height',
      'max',
      'min',
      'padding',
      'width'
    ];
  }

  get max () {
    return this.getAttr('max');
  }
  
  set max (newVal) {
    this.setAttr('max', newVal);
  }

  get min () {
    return this.getAttr('min');
  }
  
  set min (newVal) {
    this.setAttr('min', newVal);
  }
  
  get padding () {
    return this.getAttr('padding');
  }
  
  set padding (newVal) {
    this.setAttr('padding', newVal);
  }
  
  render () {
    if (this.data.length) {
      this.shadowRoot.innerHTML = `<svg width="${this.width}" height="${this.height}"></svg>`;

      // Based upon the number of data points and the padding between bars,
      // calculate bar width.
      let barWidth = (this.width - ((this.data.length - 1) * 0.7)) / this.data.length;

      var x = d3.scaleLinear()
                .domain([0, this.data.length - 1])
                .range([0, (this.data.length - 1) * (barWidth + 0.7)]);

      var y = d3.scaleLinear()
                .domain([Math.min(this.min, d3.min(this.data)), d3.max(this.data)])
                .range([this.height, 0]);

      // This chart draws from the y-axis upwards for positive values and from the
      // y-axis downwards for negative values.
      d3.select(this.shadowRoot).select('svg')
        .selectAll('rect')
        .data(this.data)
        .enter()
        .append('rect')
        .attr('fill', this.fill[0])
        .attr('x', (d, i) => x(i))
        .attr('y', (d) => d < 0 ? y(0) : y(d))
        .attr('width', barWidth)
        .attr('height', (d) => d < 0 ? y(d) - y(0) : y(0) - y(d));
    }
  }
}

// Register all of the custom elements for which we created classes.
customElements.define('wc-pie', PieElement);
customElements.define('wc-donut', DonutElement);
customElements.define('wc-line', LineElement);
customElements.define('wc-bar', BarElement);

window.addEventListener('WebComponentsReady', function(e) {
  // This is just testing the function the WebComponents polyfill provides. It
  // gets called at the same point whether it polyfilled anything or not.
  console.log('Components are ready');
});
