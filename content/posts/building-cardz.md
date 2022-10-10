+++
title = "Building an educational machine learning app with GPT-3"
date = 2022-04-28
description = "Building a flashcard app that uses machine learning was not an easy task. This post details some of the challenges and hurdles I faced while making Cardz."

slug = "building-cardz"

[taxonomies]
tags = ["product", "machine learning", "flashcards", "cardz"]

[extra]
comments = true
og_image = "/posts/building-cardz/flashcards-og.webp"
+++

<!-- ![A picture of Cardz's main deck view page.](deck.png) -->

> **Please note that Cardz is currently offline and pending maintenance. Back soon!**

{% figure(src="flashcards-og.webp", alt="Flashcards across the screen, with five main ones in view.") %}
    "_The flashcard app that uses machine learning to help you learn._"
{% end %}

Cardz was an idea that was originally thought of in 2020, just after the GPT-3 release date. Given access to such a versatile natural language parser, I wanted to apply it to help me in my own schoolwork.

I use flashcards liberally to help me retain information. This technique is called [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) and can help beat the [forgetting curve](https://en.wikipedia.org/wiki/Forgetting_curve) - the idea that we forget information over time. The idea is that if you review information at regular intervals, you will remember it better.

My elevator pitch was essentially - what if there was a website that leveraged the latest language models to help you make flashcards? You could:
-   Just highlight some text in your book and have it automatically turned into a flashcard
-   Submit your book to the website and have it automatically generate flashcards for you
-   Export your flashcards to Anki, Quizlet, or other flashcard apps
-   View others' flashcards and add them to your own decks

I started with a planning document, but almost immediately moved to iterating on the idea. I wanted to get a prototype out as soon as possible, so I could get feedback from others. I also wanted to get a feel for how much work it would be to build the app.

I created an proof of concept within a couple of days, but it was not until 2021 that I decided to launch it as a full-fledged product. The full product would require more than just a proof-of-concept, including authentication, data handling and storage, design work, UI and UX, and a backend.

{% figure(src="systems.png", alt="Many folders in MacOS finder.") %}
    A look at the amount of systems powering Cardz during it's development.
{% end %}

Product design approach
-----------------------

I started with a simple design document, which I used to plan out the features I wanted to include. I also used it to plan out the user flow, and how I would implement the features.

Cardz needed to be:
-  Easy to use
-  Fast
-  Familiar, e.g utilise the same interaction patterns as other websites

I wanted to make the app as easy to use as possible, so I decided to use a familiar interaction pattern. I also wanted to make it as fast as possible, so I decided to use a single-page application (SPA) to reduce the number of page loads.

Backend systems
---------------

### Web services

Cardz has a severless backend that allows for scaling up or down based on demand extremely quickly. The main backend server is written in Python with the Flask framework.

There are microservices that run on a schedule that manage sending emails. There are also serverless workers that run extremely quickly for small tasks such as adding cross-origin resource sharing headers to static files.

All web properties are fronted using Cloudflare CDN, which allows for less load on the server and more bandwidth. There is also caching on the backend systems themselves that allows for faster page loads.

### Database and authentication

Due to the complexity of managing databases as well as user credentials, I elected to use **Firebase** as a backend platform. This allowed for the abstraction of the database and login system and greatly accelerated the development time.

*   All application data is stored in Firestore, where it is queried and updated.
*   All user authentication and management occurs in Firebase Authentication. This includes sending password reset emails and verifying email addresses.
*   Uploaded files are stored in Firebase Storage (a rebrand of Google Cloud Storage).
*   The front end is built and served by Firebase Hosting.

While a main feature of Firebase is the client-side integration, I elected to move all interaction with Firebase to the back-end, and use a traditional REST API for communication with the front-end.

This was because Cardz features primarily server-generated content instead of purely user-generated content, so it would be easiest for the server to handle the storage and retrieval of said content.

### Machine learning operations
There are multiple pipelines that power the machine learning features on the Cardz platform.
- For real-time generation, such as the flashcard generation, I use the OpenAI GPT-3 platform. This is cost-effective and infinitely scalable, and also cuts down on time spent focussing on the infrastructure.
- For batched generation (e.g the question bank), we use GCP instances with GPUs which get spun up and down as jobs are assigned to them. This allows for more efficient use of resources, and also allows for more complex models to be used.

#### Flashcard generation

GPT-3 is only available through a REST API, so it is impossible to specify the conditions of model training and running.

In the MVP version of Cardz, I used prompt engineering techniques to "train" GPT-3 on every completion request. Since then, OpenAI has released features to pretrain a model. I immediately switched to using this feature, as it allows for much more control over the model.

To generate a pretrained model, all that is required is a list of prompts and completions. The prompts are the question, and the completions are the answer. The model is then trained on these prompts and completions.