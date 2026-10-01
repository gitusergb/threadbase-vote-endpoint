You will build the complete POST /posts/:id/vote endpoint on Threadbase — independently, without a mentor walking you through it. By the end, you will have a working GitHub repository with a Post score counter, a Vote join table that makes double voting impossible, and an Express route that records a vote and bumps the score as one atomic transaction, with every failure mapped to the correct HTTP status code.

This is the synthesis of the whole Prisma module: the atomic increment from m2-L04, the $transaction from m2-L10, and Prisma error codes, all in one real route.

Step-by-step instructions
1. Create a GitHub repository
Go to github.com and create a new public repository named threadbase-vote-endpoint. Do not initialise it with a README.

2. Set up the project locally
mkdir threadbase-vote-endpoint && cd threadbase-vote-endpoint
npm init -y
npm pkg set type="module"
npm install express @prisma/client@7.10.0 @prisma/adapter-pg pg dotenv
npm install -D prisma@7.10.0 tsx typescript @types/node @types/express @types/pg
npx tsc --init
npx prisma init --datasource-provider postgresql --output ../generated/prisma
Set DATABASE_URL in .env to point to a local PostgreSQL database named threadbase.

3. Write the schema and migrate
In prisma/schema.prisma, add a User, a Post with a score counter, and a Vote join table with a composite unique constraint:

model User {
  id    Int    @id @default(autoincrement())
  name  String
  votes Vote[]
}

model Post {
  id    Int    @id @default(autoincrement())
  title String
  body  String
  score Int    @default(0)
  votes Vote[]
}

model Vote {
  id     Int  @id @default(autoincrement())
  userId Int
  postId Int
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
}
Run the migration:

npx prisma migrate dev --name add-votes
Then create at least one user and two posts to vote on (a quick prisma.user.create() / prisma.post.createMany() script, or use npx prisma studio).

4. Create the Prisma singleton and the Express app
src/lib/prisma.ts — a PrismaClient singleton.
src/app.ts — an Express app with express.json(), a stub auth middleware that sets req.user = { id: 1 } (so you can test without real auth), and the posts router mounted at /posts.
5. Build the vote endpoint
In src/routes/posts.ts, implement POST /posts/:id/vote following the five-step skeleton from the lesson. The route must:

Parse postId with parseInt(req.params.id) and read userId from req.user.id.
Validate — if isNaN(postId), return 400 before touching the database.
Query — inside one prisma.$transaction([...]), create the Vote row and increment the post's score. Use the atomic { score: { increment: 1 } } — not a read-then-write.
Respond — return 201 with the post's new score on success.
Handle errors in the catch block: map P2002 → 409 ("already voted") and P2025 → 404 ("post not found"); pass anything else to next(err).
Stretch (optional, for the bonus criterion): convert the route into a toggle — if the user already voted, delete the vote and decrement the score instead (also inside a $transaction).

6. Test it with Thunder Client (or Postman)
Run your app (npx tsx src/app.ts) and make these four requests, capturing the status code each time:

Request	Expected
POST /posts/1/vote (first time)	201 — score increases by 1
POST /posts/1/vote (same user again)	409 — already voted (or, with the toggle, 200 and score −1)
POST /posts/999999/vote	404 — post not found
POST /posts/abc/vote	400 — invalid id
7. Push to GitHub
Add a .gitignore first — it must exclude node_modules/ and .env (never commit your database credentials):

node_modules/
.env
dist/
git init
git add .
git commit -m "feat: vote endpoint with Prisma transaction and atomic increment"
git branch -M main
git remote add origin https://github.com/<your-username>/threadbase-vote-endpoint.git
git push -u origin main
8. Create a Pull Request
Create a feature branch and open a PR into main:

git checkout -b feature/vote-endpoint
git push origin feature/vote-endpoint
Go to your GitHub repository → Pull Requests → New pull request. Set base: main, compare: feature/vote-endpoint. Title your PR: feat: POST /posts/:id/vote endpoint. The PR description must include a screenshot of your Thunder Client results showing the four status codes from step 6 (201, 409, 404, 400).

9. Submit
Copy the PR URL (it looks like https://github.com/<your-username>/threadbase-vote-endpoint/pull/1) and submit it via the assignment portal on the Kalvium learning platform.

Checklist before submitting
 prisma/schema.prisma has score Int @default(0) on Post and a Vote model with @@unique([userId, postId])
 A migration file exists in prisma/migrations/
 The vote and the score update run inside one prisma.$transaction
 The score uses { increment: 1 } — no findUnique then update with score + 1
 parseInt + isNaN guard returns 400; P2002 → 409; P2025 → 404; success returns 201
 .env is in .gitignore and not committed
 PR description includes the Thunder Client screenshot of all four status codes