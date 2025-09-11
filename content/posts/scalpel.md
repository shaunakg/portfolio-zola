+++
title = "Scalpel - a surgical rotation assistant"
date = 2025-02-01
description = "Scalpel helps med students prepare for their surgical rotations by providing them with comprehensive information about any surgical procedure."

slug = "scalpel"

[taxonomies]
tags = ["project", "llm", "scalpel", "medicine"]

[extra]
comments = true
+++

{% callout(type="info", title="TL;DR") %}
I created a super fast surgical procedure summary tool using Vite and React. Give it a go: [https://scalpel.srg.id.au](https://scalpel.srg.id.au)
{% end %}

## Background

This year, I started my clinical placements. As many medical students will know, the independence and lack of hand-holding is something that can take a moment to get used to.

One of the most significant challenges I faced this year occurred during my surgical rotation. In my hospital, students do not have access to the operating theatre schedules, and the only way to see which surgeries are scheduled is to visit the theatre and consult a paper list, which you can only do in the small gap after rounds but before the first surgeries. This means that I often only found out which surgery was taking place minutes before scrubbing in, leaving me wholly unprepared for any questions I might be asked.

Furthermore, the operating theatre list often has abbrevations or acronyms that are not always clear. For example, take the procedure `ORIF distal rad +/- K-wire`. This refers to an open reduction and internal fixation of the distal radius (a bone in your forearm), with or without inserting a pin in the bone. To be as prepared as possible, I would need to look up:

- What is an ORIF?
- What is a K-wire?
- When do we decide whether to use a K-wire?

Ideally, I would also want to read up on all the anatomy involved in the procedure (any landmarks, major anatomical structures and any risks associated with the procedure). However, with only 15-20 minutes to spare before scrubbing in, I would usually have to skip this step. This left me at risk of one of the worst things that can happen to a medical student: getting caught not knowing the basics.

Therefore, I decided to create a small web app that uses an LLM to provide medical students with all the information they could possibly need for their rotation in a timely manner. I named the result of this effort *Scalpel* because it cuts through the confusion. In this blog post, I'll go through the features, the reasoning behind them, and how I implemented them.

## Key features

### Fast, flexible procedure input

A key problem I identified was the lack of a standard naming system for procedures, at least in the OR schedules (which is the only source I had access to). Therefore, Scalpel accepts any procedure name, abbreviation or description. An LLM is used to suggest a long procedure name that matches the input, and that name is used for the rest of the generation process. The LLM also generates alternative names for the procedure, which are indexed and displayed alongside the main name. This allows users to quickly find pre-generated pages for procedures.

{% figure(src="1.jpg", alt="Annotated search flow for Scalpel.") %}
The input and search system was designed to meet the use case: flexible procedure inputs.
{% end %}

However, for medical students that potentially do have access to exact procedure names, or a SNOMED CT code, Scalpel provides a search and autocomplete feature. Any SNOMED CT code is accepted as input, and textual inputs also search the SNOMED code database to find the corresponding procedure name. This system uses a [ZincSearch](https://github.com/zincsearch/zincsearch) search engine instance with a Cloudflare Worker in front of it for caching.

{% figure(src="searchengine.svg", alt="Search engine diagram for the SNOMED search.") %}
The search engine architecture is designed for redundancy and speed.
{% end %}

Because speed is critical for Scalpel, I performed stress testing on the search engine with [`vegeta`](https://github.com/tsenart/vegeta). The results are displayed below. 50% of requests are served in less than 40ms, and 99% in less than 147ms.

{% figure(src="histogram.png", alt="Histogram of response times for the SNOMED search.") %}
Stress testing shows a p99 latency of 147ms, and a p50 latency of 40ms.
{% end %}

### Fast generation

It is critical that information is displayed as fast as possible. When dealing with LLMs, this not only means generating the data quickly, but finding ways to display generated tokens in the UI before the full procedure entry is complete. This allows students to immediately start learning about the procedure.

To optimise **generation speed**, I decided to use Meta AI's LLaMA 3.3 model with 70 billion parameters. This achieves a good mix between size (needed for accuracy) and speed (needed for responsiveness). The chosen inference provider is Cerebras, who serve this model at ~2100 tok/s, orders of magnitude faster than other providers.

To optimise **display speed**, I chose to parallelise the generation process. This involves splitting the generation task into smaller chunks and processing them concurrently. By doing so, the UI can display partial results as soon as they are available, rather than waiting for the entire procedure to be generated.

The result of this is that the first procedure descriptions are usually visible within 2 seconds, and the entire procedure is generated within 5 seconds.

{% video(
  src="aaa-repair.mp4",
  alt="Video showing Scalpel generating a procedure page for the procedure 'AAA repair w/ EVAR explant'.",
  autoplay=true,
  muted=true,
  controls=true,
  loop=true
) %}
Most responses are generated in 5 seconds, with visible text appearing within 2 seconds. Every generated section is displayed as soon as it is available, allowing the user to start learning about the procedure immediately.
{% end %}
