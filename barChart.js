let state = {
  categories: [
    { id: 1, name: 'Housing', amount: 1200, color: '#22d3ee' },
    { id: 2, name: 'Food', amount: 450, color: '#34d399' },
    { id: 3, name: 'Transportation', amount: 220, color: '#f59e0b' },
    { id: 4, name: 'Healthcare', amount: 180, color: '#ef4444' },
    { id: 5, name: 'Entertainment', amount: 140, color: '#a78bfa' }
  ],
  nextId: 6,
  showPercentages: true
};

const margin = { top: 40, right: 30, bottom: 60, left: 80 };
const chartWidth = 800;
const chartHeight = 500;
const width = chartWidth - margin.left - margin.right;
const height = chartHeight - margin.top - margin.bottom;

const formatCurrency = d3.format('$,');
const formatPercent = d3.format('.0%');
const calculateTotal = () => state.categories.reduce((sum, cat) => sum + cat.amount, 0);

const svg = d3.select('#bar-chart');
const emptyState = d3.select('#empty-state');
const categoriesContainer = d3.select('#categories-container');
const legend = d3.select('#legend');
const totalAmountEl = d3.select('#total-amount');

d3.select('#show-percentages').on('change', function() {
  state.showPercentages = this.checked;
  renderChart();
});

d3.select('#add-category-btn').on('click', addCategory);

d3.select('#new-category-name').on('keypress', function(event) {
  if (event.key === 'Enter') addCategory();
});
d3.select('#new-category-amount').on('keypress', function(event) {
  if (event.key === 'Enter') addCategory();
});

function addCategory() {
  const nameInput = document.getElementById('new-category-name');
  const amountInput = document.getElementById('new-category-amount');
  const colorInput = document.getElementById('new-category-color');
  
  const name = nameInput.value.trim();
  const amount = Math.max(0, parseFloat(amountInput.value) || 0);
  const color = colorInput.value;
  
  if (!name) {
    alert('Please enter a category name');
    return;
  }
  
  state.categories.push({
    id: state.nextId++,
    name: name,
    amount: amount,
    color: color
  });
  
  nameInput.value = '';
  amountInput.value = '';
  
  renderCategoryInputs();
  renderChart();
  updateTotal();
}

function deleteCategory(id) {
  state.categories = state.categories.filter(cat => cat.id !== id);
  renderCategoryInputs();
  renderChart();
  updateTotal();
}

function updateCategoryAmount(id, newAmount) {
  const category = state.categories.find(cat => cat.id === id);
  if (category) {
    category.amount = Math.max(0, newAmount);
    renderChart();
    updateTotal();
  }
}

function updateCategoryColor(id, newColor) {
  const category = state.categories.find(cat => cat.id === id);
  if (category) {
    category.color = newColor;
    renderChart();
    renderLegend();
    renderCategoryInputs();
  }
}

function updateCategoryName(id, newName) {
  const category = state.categories.find(cat => cat.id === id);
  if (category) {
    category.name = newName.trim() || category.name;
    renderChart();
    renderLegend();
  }
}

function renderCategoryInputs() {
  const rows = categoriesContainer
    .selectAll('.category-row')
    .data(state.categories, d => d.id);
  
  const rowsEnter = rows.enter()
    .append('div')
    .attr('class', 'category-row');
  
  const labelDiv = rowsEnter.append('div')
    .attr('class', 'category-label');
  
  const colorDot = labelDiv.append('div')
    .attr('class', 'color-dot')
    .style('background-color', d => d.color);
  
  colorDot.append('input')
    .attr('type', 'color')
    .attr('value', d => d.color)
    .on('change', function(event, d) {
      updateCategoryColor(d.id, event.target.value);
    });
  
  labelDiv.append('span')
    .attr('class', 'category-name')
    .attr('title', 'Double-click to edit')
    .text(d => d.name)
    .on('dblclick', function() {
      this.setAttribute('contenteditable', 'true');
      this.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this);
      selection.removeAllRanges();
      selection.addRange(range);
    })
    .on('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.blur();
      }
    })
    .on('blur', function(event, d) {
      this.removeAttribute('contenteditable');
      updateCategoryName(d.id, this.textContent);
    });
  
  rowsEnter.append('input')
    .attr('type', 'number')
    .attr('min', 0)
    .attr('value', d => d.amount)
    .on('input', function(event, d) {
      if (event.target.value !== '') {
        updateCategoryAmount(d.id, parseFloat(event.target.value));
      }
    });
  
  rowsEnter.append('button')
    .attr('class', 'delete-btn')
    .text('x')
    .on('click', (event, d) => deleteCategory(d.id));
  
  rows.merge(rowsEnter)
    .select('.color-dot')
    .style('background-color', d => d.color)
    .select('input[type="color"]')
    .property('value', d => d.color);
  
  rows.merge(rowsEnter)
    .select('input[type="number"]')
    .property('value', d => d.amount);
  
  rows.exit().remove();
  
  renderLegend();
}

function renderLegend() {
  const items = legend
    .selectAll('.legend-item')
    .data(state.categories, d => d.id);
  
  const itemsEnter = items.enter()
    .append('div')
    .attr('class', 'legend-item');
  
  itemsEnter.append('div')
    .attr('class', 'legend-dot')
    .style('background-color', d => d.color);
  
  itemsEnter.append('span')
    .attr('class', 'legend-label')
    .text(d => d.name);
  
  items.merge(itemsEnter)
    .select('.legend-dot')
    .style('background-color', d => d.color);
  
  items.merge(itemsEnter)
    .select('.legend-label')
    .text(d => d.name);
  
  items.exit().remove();
}

function updateTotal() {
  const total = calculateTotal();
  totalAmountEl.text(formatCurrency(total));
}

function renderChart() {
  const total = calculateTotal();
  
  emptyState.classed('hidden', state.categories.length > 0);
  
  if (state.categories.length === 0) {
    svg.selectAll('*').remove();
    return;
  }
  
  svg.attr('viewBox', `0 0 ${chartWidth} ${chartHeight}`);
  
  let g = svg.select('g.chart-group');
  if (g.empty()) {
    g = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    g.append('g').attr('class', 'axis-y');
    g.append('g').attr('class', 'bars');
  }
  
  const yScale = d3.scaleLinear()
    .domain([0, Math.max(total, 100)])
    .range([height, 0])
    .nice();
  
  const yAxis = d3.axisLeft(yScale)
    .ticks(6)
    .tickFormat(formatCurrency);
  
  g.select('.axis-y').call(yAxis);
  
  let cumulative = 0;
  const stackedData = state.categories.map(cat => {
    const start = cumulative;
    const end = cumulative + cat.amount;
    cumulative = end;
    return {
      ...cat,
      y0: start,
      y1: end
    };
  });
  
  const barWidth = 120;
  const barX = (width - barWidth) / 2;
  
  const bars = g.select('.bars')
    .selectAll('rect.bar-segment')
    .data(stackedData, d => d.id);
  
  bars.enter()
    .append('rect')
    .attr('class', 'bar-segment')
    .attr('x', barX)
    .attr('width', barWidth)
    .attr('y', yScale(0))
    .attr('height', 0)
    .attr('fill', d => d.color)
    .style('cursor', 'pointer')
    .merge(bars)
    .attr('y', d => yScale(d.y1))
    .attr('height', d => Math.max(0, yScale(d.y0) - yScale(d.y1)))
    .attr('fill', d => d.color);
  
  bars.exit().remove();
  
  const labels = g.select('.bars')
    .selectAll('text.percentage-label')
    .data(state.showPercentages ? stackedData.filter(d => {
      const percentage = d.amount / total;
      const segmentHeight = yScale(d.y0) - yScale(d.y1);
      return percentage >= 0.05 && segmentHeight >= 25;
    }) : [], d => d.id);
  
  labels.enter()
    .append('text')
    .attr('class', 'percentage-label')
    .attr('text-anchor', 'middle')
    .attr('x', barX + barWidth / 2)
    .attr('y', d => {
      const segmentHeight = yScale(d.y0) - yScale(d.y1);
      return yScale(d.y1) + segmentHeight / 2;
    })
    .attr('dy', '0.35em')
    .text(d => formatPercent(d.amount / total))
    .merge(labels)
    .attr('x', barX + barWidth / 2)
    .attr('y', d => {
      const segmentHeight = yScale(d.y0) - yScale(d.y1);
      return yScale(d.y1) + segmentHeight / 2;
    })
    .text(d => formatPercent(d.amount / total));
  
  labels.exit().remove();
}

function init() {
  renderCategoryInputs();
  renderLegend();
  renderChart();
  updateTotal();
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderChart();
    }, 250);
  });
}

init();