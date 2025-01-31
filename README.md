
# **WorldNews Project**

WorldNews is a project that fetches the latest news using an API. This README will guide you through setting up the frontend and backend servers, as well as making the necessary changes to access news data securely.

---

## **Table of Contents**
- [Project Setup](#project-setup)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)

---

## **Project Setup**

### **Frontend Setup**
1. Clone the repository:
   ```sh
   git clone https://github.com/chrlzs/worldnews.git
   cd worldnews
   ```

2. Install the necessary dependencies:
   ```sh
   npm install
   ```

### **Backend Setup**
To securely handle your API keys and fetch news data, we’ve added a backend server using **Node.js** and **Express**. Follow these steps to set up the backend.

1. Navigate to your project directory and create a new folder for the backend:
   ```sh
   mkdir worldnews-backend && cd worldnews-backend
   ```

2. Initialize a new Node.js project:
   ```sh
   npm init -y
   ```

3. Install the required dependencies:
   ```sh
   npm install express dotenv axios cors
   ```

4. Create the necessary files:
   ```sh
   touch server.js .env
   ```

5. Edit the `.env` file with your **News API** key:
   ```
   NEWS_API_KEY=your_api_key_here
   PORT=5000
   ```

6. Create the backend server in `server.js`:
   ```javascript
   require('dotenv').config();
   const express = require('express');
   const axios = require('axios');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 5000;

   // Middleware
   app.use(cors());
   app.use(express.json());

   // News API Route
   app.get('/news', async (req, res) => {
       try {
           const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
               params: {
                   apiKey: process.env.NEWS_API_KEY,
                   country: 'us'
               }
           });
           res.json(response.data);
       } catch (error) {
           res.status(500).json({ error: "Failed to fetch news" });
       }
   });

   // Start Server
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

---

## **Environment Variables**

Ensure you have the following environment variables set in the `.env` file:

- `NEWS_API_KEY`: Your API key for the news service (from NewsAPI).
- `PORT`: The port for your backend server (default: `5000`).

Example `.env` file:

```
NEWS_API_KEY=your_api_key_here
PORT=5000
```

---

## **Running the Project**

### **1. Run the Backend Server**
From the `worldnews-backend` folder, run the following command:

```sh
node server.js
```

This will start the server at `http://localhost:5000`. The backend is responsible for fetching news data securely.

### **2. Run the Frontend Application**
Once your backend is running, open the `worldnews` folder in your terminal and run:

```sh
npm start
```

Visit `http://localhost:3000` to view the frontend application.

---

## **Deployment**

Once you’re ready to deploy the application, you can deploy the backend server using platforms like **Render**, **Vercel**, or **Railway**. The frontend can be deployed on platforms like **Netlify** or **Vercel** as well.

For deployment, don’t forget to set up the necessary environment variables in your chosen platform (e.g., **NEWS_API_KEY**) through the platform's dashboard.

