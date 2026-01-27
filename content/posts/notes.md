+++
title = "Optimizing my medical school note-taking"
date = 2026-01-26
description = "How I store all my notes, flashcards, references and resources in one place."

[taxonomies]
tags = ["medicine", "obsidian", "productivity"]

[extra]
comments = true
og_image = "https://cdn.srg.id.au/notes-og.jpg"
use_image_as_title = "https://cdn.srg.id.au/notes-header.webp"
# feature_image = "/posts/med-school-obsidian/og-bg.png"
+++

<!-- 

-- structure --

intro

Introducing The Matrix
- explanation of the spreadsheet
- self-directed learning

Why Obsidian?
- alternatives? notion, anki, physical
- local-first, markdown, extensible
- speed and offline-first

Wrangling The Matrix
- sorting the matrix into folders by system
- using templates for condition notes, using a script
- using obsidian bases to sort

Taking notes on placement
- digital notes in obsidian for conditions 
- paper notebooks for clinical observations (muji lie-flat)
- sync em

Study workflow
1. choose what to study (random matrix extension)
2. take notes for that condition 
3. integrate with anki (obsd -> anki OR anking)
4. track progress

Reflections from year 3
- hopefully this saves time and reduces decision anxiety over what to study next
- in year 3, had a similar system but 
    - used tables for conditions - TRASH because lots of obsidian formatting isn't supported in tables
    - didnt have the random matrix thing -> lots of "not sure what to do" or "bored of doing this system"
    - didn't do anki (this is entirely my fault)

hopefully this works! see you in 180 days.

done

 -->

<style>

.matrix {
    display: inline-block;
    text-shadow:
        0 0 6px rgba(0, 255, 153, 0.85),
        0 0 14px rgba(0, 255, 153, 0.7),
        0 0 28px rgba(0, 255, 153, 0.55),
        0 0 44px rgba(0, 255, 153, 0.35);
    animation: matrix-buzz 0.18s steps(2, end) infinite;
}

@keyframes matrix-buzz {
    0% { transform: translate(0, 0) rotate(0deg); }
    12% { transform: translate(0.5px, -0.5px) rotate(0.15deg); }
    25% { transform: translate(-0.6px, 0.4px) rotate(-0.2deg); }
    38% { transform: translate(0.4px, 0.6px) rotate(0.1deg); }
    50% { transform: translate(-0.5px, -0.4px) rotate(-0.15deg); }
    63% { transform: translate(0.6px, 0.3px) rotate(0.2deg); }
    75% { transform: translate(-0.4px, 0.5px) rotate(-0.1deg); }
    88% { transform: translate(0.5px, -0.3px) rotate(0.15deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
}

</style>

My second clinical year of med school starts tomorrow - 180 days of intensive placement across general practice, obstetrics & gynaecology, paediatrics and psychiatry. This year, we have 585 conditions to learn, 230 of which are "rank 1s" - the most important conditions that will likely appear on our exams.

Year 4 is generally considered the hardest year at my medical school, so in order to not fail, I've spent the last few weeks optimising my notes as much as possible to make it easier for me to study. In this post, I'll cover that setup - the note-taking app I use, how I organise my notes and how I use flashcards to increase recall.

## Introducing <span class="matrix">The Matrix</span>

<span class="matrix">The Matrix</span> (emphasis required) is how we are provided the conditions to learn for the year. It is a massive spreadsheet of medical conditions, categorised into body systems and ranked by their importance for the year. Rank 1 conditions are almost certain to be on the exam and rank 3s are the least likely.

{% figure(src="3matrix.png", alt="A dense spreadsheet with many coloured lines, representing conditions.") %}
A section of <span class="matrix">The Matrix</span> for Year 3.
{% end %}

This is sent to us as a PDF document at the start of the year, with (as you can see) lots of columns. Students are expected to self-study these conditions, with the only assessment of your knowledge being the end-of-year exams.

Therefore, it's critical to get organisation and study technique down pat at the start of the year, since if you're studying wrong, it's hard to know and therefore to course-correct.

## Why Obsidian?

I've chosen to do the bulk of my note-taking in [Obsidian](https://obsidian.md/), a free, fast, and local-first note-taking app with lots of customisability. Some people use it to create a personal knowledge base or "second brain", which basically means dumping everything you want to know into one place. Obsidian has really great in-built tools to organise and cross-reference this information which makes it great for this purpose.

*Local-first* means that everything you create is stored locally on your computer, which means that you own your data and you can be assured that it's safe, even if Obsidian shuts down or changes ownership. Also, your notes are in a format called [Markdown](https://www.markdownguide.org/getting-started/) which you can edit using any text editor (so you don't necessarily need Obsidian to manage your notes).

{% callout(type="info", title="But it doesn't sync to my phone?", collapsible=true) %}

When I ask my friends about why they chose their particular notetaking software, or why they haven't switched to Obsidian, one of the most common reasons I hear is "it doesn't back up" or "I can't access the notes on my phone". I completely get it - syncing is super important to me as well and the fact that this feature costs money in Obsidian is a turn-off.

However, in this section I'll attempt to convince you to give local-first notes a go. There are basically two reasons why I enjoy having my notes in Markdown, in a folder on my computer:

1. **test**

{% end %}

I personally use it because it's very fast, works offline without sign-in, and is super extensible with plugins (as you'll see).

<!-- As I progress through medical school, the way we are taught content has evolved. My pre-clinical years were very guided, with specific lectures and workshops that taught everything we needed to know. However, in clinical years, we transition from didactic learning to self-study.

The content we are required to learn for the year is listed in **The Matrix** (emphasis necessary), a massive spreadsheet of medical conditions. They are classified into body systems/medical specialities, and each assigned a rank (where rank 1 conditions are the most important to learn and rank 3 the least).

{% figure(src="3matrix.png", alt="A dense spreadsheet with many coloured lines, representing conditions.") %}
A section of **The Matrix** for Year 3.
{% end %}

Obviously, not only is this difficult to learn, it's hard to even keep track of your learning. My colleagues have figured out various techniques of managing this, such as printing out a physical planner, manually creating pages for each condition in Notion or making a spreadsheet of all the conditions and their ranks.

My approach is to use Obsidian to sort these conditions into a manageable knowledge base. In this blog post, I'll be covering the organisation of my Obsidian vault, as well as some plugins that I think are really useful as a medical student.

## What is Obsidian?

Before we begin, let me cover the basics. 

## Organising **The Matrix**

My medical gives us quite a few conditions to memorise. In Year 3, we had 230 conditions with 79 rank 1s, and in Year 4 we have 585 conditions with 296 rank 1s. 

So, it's quite important to organise these in a way that allows me to take notes for each of them as easily as possible, and keep track of the ones that have been completed. Some ideas I had were:

- Taking all of my notes in Anki. My best friend uses this technique and does quite well with it, but to me, it seems super difficult to organise. Additionally, I usually use the [Anking deck](https://www.ankihub.net/step-deck) in order to avoid creating my own cards, and they're not organised in the same way as my medical school's conditions.
- Using Notion to organise notes in some sort of database format, where each entry is a condition. I like Notion's design and database system a lot, but I didn't want to lock-in my notes 

{% carousel() %}
    {% carousel_item(src="base.png", alt="Obsidian base layout") %}
    The base structure of my vault.
    {% end %}

    {% carousel_item(src="folders.png", alt="Obsidian folder structure") %}
    The core folders that map to each system.
    {% end %}

    {% carousel_item(src="graph.png", alt="Obsidian graph view") %}
    The graph view shows how conditions link together.
    {% end %}
{% end %} -->
