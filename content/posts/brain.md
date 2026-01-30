+++
title = "Chopping my brain into bits"
date = 2026-01-31
description = "Splitting myself apart."
draft = true

[taxonomies]
tags = ["medicine"]

[extra]
banner_iframe = "/posts/brain-post-banner/index.html"
+++

Have you ever seen your brain peeking out from behind your semi-translucent skull, the frontal lobe slightly visible through your empty eye sockets?

{% figure(src="skull.gif", alt="A rotating, semi-translucent 3D model of a skull.") %}
Well, I have!
{% end %}

It turns out that when you get an MRI for a research study, they send you the raw DICOM data. However, the default viewer that they tell you to use is really only useful for radiologists. For the rest of us, it's just a bit creepy.

However, when I recieved the raw data, I wanted to see what I could do with it. Quite a lot, it turns out. In this post, I'll go over how I turned my raw MRI scan into the interactive graphic you're seeing above, plus some other interesting data I was able to extra.

## The data 

I recieved my MRI scan in NIfTI (Neuroimaging Informatics Technology Initiative) format, which is a raster file format for storing neuroimaging data. My specific scanner was a 7 Tesla machine, which is quite a lot stronger than the ~1.5T they use in hospitals (research-level scanners usually are). [^1]

[^1]: Unfortunately, even though NIfTI supports 4D (3D + time) neuroimaging, I wasn't able to source longitudinal data from the researchers.

