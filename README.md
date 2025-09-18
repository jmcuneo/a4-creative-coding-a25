Shift Tracker — A3

Render Link: https://a3-niajunod-a25.onrender.com/
Vercel Link: https://a3-nia-junod-a25-klzz3zxrk-niajunods-projects.vercel.app/

I did some research to find another web service hosting platform. And Vercel is similar to Render. At least I tried AWS, but I got confused; and it was complex. So I put both Render and Vercel link to be safe. 


Project Summary

Shift Tracker is a two-tier web application that helps restaurant workers log their shifts, calculate tips, and track hourly pay. The application includes authentication, persistent data storage, and a polished UI powered by Bootstrap.

Goals of the application:

Provide a lightweight tool for tracking work shifts and calculating earnings.

Allow users to log in, create accounts, and manage their personal shift data securely.

Persist user data across sessions using MongoDB.

I will most likely give this website to where I work at the Pridwin Hotel, it would be useful for FOH staff. 

Challenges faced:

Implementing authentication logic (login vs. create account) in Express.

Configuring MongoDB and managing persistent storage.

Debugging accessibility and SEO issues to push Lighthouse scores above 90%.

Authentication strategy:

Simple username/password login (accounts are created automatically if they do not exist).

This was chosen because it aligns with the assignment requirements and keeps the focus on core persistence features.

CSS framework:

Bootstrap 5
 was chosen for its professional styling, responsive grid system, and accessibility support.

Custom CSS (/css/styles.css) was added for branding (colors, spacing, typography). Example modifications:

White background with accent colors for buttons.

Improved table readability with striped rows.

Accessible contrast for primary buttons.

Express middleware packages used:

express.json() — parses JSON request bodies.

express.urlencoded() — parses URL-encoded request bodies from forms.

express.static() — serves static files such as CSS and JavaScript.

mongodb — database client for persistent storage of user shift data.

(Custom middleware) — authentication logic that checks session user and routes accordingly.

Features

Login / Create Account

Users log in with a username and password. If the account does not exist, it is automatically created.

Shift Management

Add, edit, and delete shifts (restaurant name, hours, and tips).

Results / Data Display

Logged-in users can view all their past shifts in a responsive Bootstrap table.

Stats Section

Average hourly rate, total tips, and total number of shifts.

Persistent Data

All data is stored in MongoDB and persists across server restarts.

Installation & Setup

Clone the repository:

git clone https://github.com/yourusername/a3-NiaJunod.git
cd a3-NiaJunod


Install dependencies:

npm install


Configure environment variables:

Create a .env file with your MongoDB connection string:

MONGO_URI=mongodb+srv://...
SESSION_SECRET=yourSecret


Run the server:

npm start




Testing & Lighthouse Results

Performance: 100

Accessibility: 100

Best Practices: 100

SEO: 100
I put it in a private browser since my extentions on chrome kept messing it up I guess. When I did in the regular browser it was like 90. So I put the image in the files here. 



Technical Achievements

Lighthouse Optimization (5 pts): Achieved 98–100 scores across categories by reducing unused CSS, fixing accessibility contrast, and optimizing load order.

Deployed on Render (baseline requirement).

Design Achievements

Accessibility Improvements (10 pts):
Followed W3C accessibility tips including:

ARIA labels on navigation and live regions.

Sufficient color contrast on buttons and inputs.

Semantic HTML (<main>, <nav>, <section>).

Form validation feedback with invalid-feedback.

Responsive design via Bootstrap grid.

Clear button text for screen readers (“Login / Create” instead of ambiguous labels).
(and more, up to 12 tips to fully claim points).

CRAP Principles (5 pts):

Contrast: Login button emphasized with Bootstrap primary color.

Repetition: Consistent use of typography and card layouts.

Alignment: Tables, forms, and buttons aligned using Bootstrap grid.

Proximity: Related form fields grouped with clear labels and spacing.

Known Issues / Future Work

Currently sessions are not stored in MongoDB — future work could integrate connect-mongo for scalable session persistence.

Could extend with OAuth (GitHub login) as an advanced feature.

Credits / Acknowledgements

Professor’s CS4241 Assignment 3 instructions.

Bootstrap 5 for CSS framework.

MongoDB Atlas for database hosting.

Render for deployment.
