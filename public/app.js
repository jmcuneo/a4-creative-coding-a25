const width = 1100;
const height = 700;
const margin = {top: 20, right: 20, bottom: 20, left: 20};
const svg = d3.select('#vis').attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');
const container = svg.append('g').attr('class', 'container');
const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
const xScale = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);
const colorScale = d3.scaleOrdinal().domain(['A','B','C']).range(['#6ee7b7', '#60a5fa', '#fca5a5']);
const state = {
  pointSize: 6,
  valueScale: 1.0,
  showLabels: false,
  minValueFilter: 0,
  colorBy: 'category'
};
let dataset = [];
fetch('/data/sample.json').then(r => r.json()).then(data => {
  dataset = data;
  initUI();
  render();
}).catch(err => {
  console.error('Failed to load data', err);
  d3.select('#vis').append('text').text('Failed to load data').attr('x', 20).attr('y', 40).attr('fill', '#fff');
});
function initUI() {
  const pane = new Tweakpane.Pane({container: document.getElementById('ui')});
  const f2 = pane.addFolder({title: 'Visuals', expanded: true});
  f2.addInput(state, 'pointSize', {min: 2, max: 30, step: 1}).on('change', () => render());
  f2.addInput(state, 'valueScale', {min: 0.2, max: 3, step: 0.1}).on('change', () => render());
  f2.addInput(state, 'showLabels').on('change', () => render());
  const f3 = pane.addFolder({title: 'Color & Filter', expanded: true});
  f3.addInput(state, 'colorBy', {options: {Category: 'category', Value: 'value'}}).on('change', () => render());
  f3.addInput(state, 'minValueFilter', {min: 0, max: 100, step: 1}).on('change', () => render());
  pane.addButton({title: 'Reset View'}).on('click', () => {
    state.pointSize = 6;
    state.valueScale = 1.0;
    state.minValueFilter = 0;
    state.showLabels = false;
    state.colorBy = 'category';
    pane.dispose();
    initUI();
    render();
  });
}
function render() {
  const filtered = dataset.filter(d => d.value >= state.minValueFilter);
  const nodes = container.selectAll('circle.node').data(filtered, d => d.id);
  nodes.exit().transition().duration(250).attr('r', 0).remove();
  const enter = nodes.enter().append('circle')
    .attr('class', 'node')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', d => Math.max(2, state.pointSize * Math.sqrt(d.value / 20) * state.valueScale))
    .style('stroke', '#071018')
    .style('stroke-width', 1)
    .on('mouseenter', (event, d) => {
      tooltip.transition().duration(120).style('opacity', 1);
      tooltip.html(`<strong>ID:</strong> ${d.id}<br/><strong>cat:</strong> ${d.category}<br/><strong>value:</strong> ${d.value}`)
        .style('left', (event.pageX + 12) + 'px')
        .style('top', (event.pageY + 12) + 'px');
    })
    .on('mousemove', (event) => {
      tooltip.style('left', (event.pageX + 12) + 'px').style('top', (event.pageY + 12) + 'px');
    })
    .on('mouseleave', () => {
      tooltip.transition().duration(120).style('opacity', 0);
    });
  const all = enter.merge(nodes);
  all.transition().duration(400)
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', d => Math.max(2, state.pointSize * Math.sqrt(d.value / 20) * state.valueScale))
    .style('fill', d => fillFor(d));
  container.selectAll('text.label').remove();
  if (state.showLabels) {
    container.selectAll('text.label')
      .data(filtered, d => d.id)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.x) + (state.pointSize + 6))
      .attr('y', d => yScale(d.y))
      .text(d => d.id)
      .attr('fill', '#cbd5e1')
      .style('font-size', '11px');
  }
}
function fillFor(d) {
  if (state.colorBy === 'category') return colorScale(d.category);
  const v = d.value;
  return d3.scaleLinear().domain([0, 100]).range(['#60a5fa', '#6ee7b7', '#fca5a5'])(v);
}
