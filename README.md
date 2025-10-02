# Budget Bar Chart Visualization

## Site Link (Firebase): https://a4-timothyhutzley.web.app/

## Project Summary
An interactive **D3.js** bar chart visualization where users create a personal budget that is dynamically visualzied through the bar chart. 

## Goal of the Application
The goal of this application is to create an interactive data visualization to help users create a budget in a more engaging way. The stacked bar chart helps users better understand how they spend their money and what categories it is dsitributed among.

## Challenges Faced
- **Changing Category States:** Implementing the ability to add, deelte, and edit categories correctly without breaking the visualization or creating duplicate elements.  
- **Color Picker:** Making the color input properly update both the visible color dot next to each category and the color on the chart is it required me to better understand how D3.js uses data binding.   
- **Displaying Percentages:** Properly determining when to display a category's percentage vs. not when the bar itself gets too small.

## Interactive Controls (4 Required Parameters)
- **Add Category:** New categories can be added with their own names, amounts, and colors  
- **Delete Category:** Any category can be removed using the "x" button to their right 
- **Edit Amounts:** The budget amount can be directly edited by double clicking them
- **Edit Colors:** The colors can be changed for any category by clicking the visisble color dot to their left  
- **Toggle Percentages:** Toggle percentage labels on the bar chart using the checkbox above the categories section  
