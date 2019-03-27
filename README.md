# Improved GraphQL + React Event Booking API

This project is originated from [Academind GraphQL Demo Code](https://github.com/academind/yt-graphql-react-event-booking-api/) and casted in [Youtube channel.](https://www.youtube.com/watch?v=7giZGFDGnkc&list=PL55RiY5tL51rG1x02Yyj93iypUuHYXcB_&index=1)

However, code examples used in that project are quite basic for beginner. Therefore, I decide to convert it by using
- Backend: GraphQL & GraphQL Yoga
- Frontend: ReactJS & Apollo Client

In order to test it in localhost, there are some steps
- Create [MongoDB Online](https://cloud.mongodb.com) and modify username and password, db name in file nodemon.json and connectionString in index.js (backend). Or, using 'docker-compose up' to setup Mongodb
- npm install / yarn install to install all packages
- npm run start / yarn start to test it in localhost