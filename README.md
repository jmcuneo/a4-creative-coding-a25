

Basic Requirements:

I created a server using Express with appropriate routes for login, logout, and CRUD operations. This replaced the basic Node server from Assignment 2 and provided a stronger foundation for future projects. (15 points)
I implemented a results page (storage.html) where logged-in users can view all their stored data, including name, email, message, and priority. This page only displays data for the authenticated user. (10 points) I built a form for adding, editing, and deleting items. The form collects name, email, message, and priority, and the results can be updated or removed from the table. This fulfills the requirement of having all three actions. (15 point) I connected my project to MongoDB using Mongoose so all data persists between sessions. This was a major improvement over Assignment 2, where everything was stored only in memory. (15 points) I styled the site using Bootstrap, which provided clean layouts, responsive forms, and a consistent navigation bar without much custom CSS.(10 points) For HTML inputs, I used text fields for name and email, a textarea for the message, and a select input for priority. These varied inputs demonstrate my ability to use multiple HTML form field types. (5 points)


Technical Achievements:

I set up authentication using bcryptjs, so passwords are stored as secure hashes instead of plain text. This was important for practicing good security habits, even though the project only requires simple login functionality. – 5 points

I used connect-mongo to persist sessions in MongoDB. This ensures users stay logged in even if the server restarts, making the app feel more realistic compared to in-memory session management. – 5 points

I added Helmet to provide security headers and Morgan to log requests to the console. These were not required for the assignment, but I included them to make the project safer and easier to debug since I plan to reuse it after the term. – 5 points

I extended the Item schema by adding a responseBy field, calculated from the item’s priority and creation date. This builds on my Assignment 2 logic and shows how to derive data automatically within the database model. – 5 points


 CSS rules:

I primarily relied on Bootstrap for a professional look and responsiveness. I used its grid system for layout and built-in form styling for inputs and buttons. To personalize it, I added a small main.css file where I adjusted table borders, button spacing, and typography. This helped make the project feel more like a portfolio site instead of just default Bootstrap styles.




Design Achievements:

I created a consistent navigation bar across all pages (About, Projects, Storage/Login). This makes the website easier to use since everything stays in the same place. – 5 points

I used Bootstrap’s grid and form system to ensure the site is responsive without much custom CSS. It looks clean and professional on different screen sizes. – 5 points

I paid attention to readability and accessibility by ensuring good spacing and alignment, and relying on Bootstrap’s default color contrast. This makes forms and tables easier to use. – 5 points

I added a small custom CSS file to tweak Bootstrap defaults, such as button spacing, table borders, and fonts. This makes the site feel cohesive and more like a personal portfolio instead of just raw Bootstrap. – 5 points


AI Use and Challenges:

This project was mainly developed in VS Code, and the most challenging parts involved getting server.js and main.js to work correctly. The biggest issue came from Helmet, which blocked inline scripts and broke my login attempts. This led me to rewrite and restructure parts of my code multiple times and even create a separate login.js to work around it. Because I struggled with login issues for a long time, I depended more on AI (ChatGPT) for troubleshooting than I initially planned. Many suggested fixes didn’t work immediately, which pushed me to experiment, rewrite, and heavily modify my code until it met my needs. Some of the login and session handling code reflects this process. That said, I plan to revisit and clean up the code to better reflect my personal style and skills instead of just AI solutions. Currently, it works and satisfies the requirements, but I want to understand it fully and make it independent of these tools. Also, Grammarly was used for the writing of this document.


Some of the resources used:

https://www.w3schools.com/Html/html_css.asp

https://www.w3schools.com/Html/html_links.asp

https://www.w3schools.com/Html/html_forms.asp

https://www.w3schools.com/Html/html_youtube.asp

https://www.w3schools.com/Html/html5_api_whatis.asp

https://developer.mozilla.org/en-US/

https://docs.npmjs.com/cli/v10/configuring-npm/package-json

