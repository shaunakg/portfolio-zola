+++
title = "Building Cardz"
date = 2022-04-28
description = "Building a flashcard app that uses machine learning was not an easy task. This post details some of the challenges and hurdles I faced while making Cardz."

[taxonomies]
tags = ["product", "machine learning", "flashcards", "cardz"]

[extra]
comments = true
+++

"_The flashcard app that uses machine learning to help you learn._"

![A picture of Cardz's main deck view page.](deck.png)

Cardz was an idea that was originally thought of in 2020, just after the GPT-3 release date. Given access to such a versatile natural language parser, I wanted to apply it to help me in my own schoolwork.

I created an proof of concept within a couple of days, but it was not until 2021 that I decided to launch it as a full-fledged product. The full product would require more than just a proof-of-concept, including authentication, data handling and storage, design work, UI and UX, and a backend.

Backend systems
---------------

### Web services

Cardz has a severless backend that allows for scaling up or down based on demand extremely quickly. The main backend server is written in Python with the Flask framework.

There are microservices that run on a schedule that manage sending emails. There are also serverless workers that run extremely quickly for small tasks such as adding cross-origin resource sharing headers to static files.

All web properties are fronted using Cloudflare CDN, which allows for less load on the server and more bandwidth.

### Database and authentication

Due to the complexity of managing databases as well as user credentials, I elected to use **Firebase** as a backend platform. This allowed for the abstraction of the database and login system and greatly accelerated the development time.

*   All application data is stored in Firestore, where it is queried and updated.
*   All user authentication and management occurs in Firebase Authentication. This includes sending password reset emails and verifying email addresses.
*   Uploaded files are stored in Firebase Storage (a rebrand of Google Cloud Storage).
*   The front end is built and served by Firebase Hosting.

While a main feature of Firebase is the client-side integration, I elected to move all interaction with Firebase to the back-end, and use a traditional REST API for communication with the front-end.

This was because Cardz features primarily server-generated content instead of purely user-generated content, so it would be easiest for the server to handle the storage and retrieval of said content.

### Machine learning pipelines

#### Flashcard generation

GPT-3 is only available through a REST API, so it is impossible to specify the conditions of model training and running.

In the MVP version of Cardz, I used prompt engineering techniques to "train" GPT-3 on every completion request. Since then, OpenAI has released features to pretrain a model. I immedi