# smart-grocery

Installation
1. Clone the repository locally
2. create .env in root folder according to .envexample
3. Install Docker https://www.docker.com/
4. Install mysql https://dev.mysql.com/downloads/mysql/
5. configure mysql setup according to .envexample file DB settings

Running the project locally
1. Run:
   docker-compose up --build

If making changes to the database schema:
   docker-compose down -v
   docker-compose up --build

Frontend: accessible at http://localhost:5173

Backend: accessible at http://localhost:3000

Logging into mysql from command line:
   1. docker exec -it smartgrocery-mysql mysql -u root -p
   2. use smartgrocery;

