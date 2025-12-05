# smart-grocery

Installation
1. Clone the repository locally
2. create .env in root folder according to .envexample
3. Install Docker https://www.docker.com/
4. Create .env file in the backend folder that mirrors .envexample.tx(found in backend folder)

Running the project locally
Run:
   docker-compose up --build

If making changes to the database schema:
   docker-compose down -v
   docker-compose up --build

Frontend: accessible at http://localhost:5173

Backend: accessible at http://localhost:3000

