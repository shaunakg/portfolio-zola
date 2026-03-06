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

<!--{% callout(type="info", title="TL;DR") %}
I took an MRI scan of my brain, segmented it into different neural structures, and created an interactive 3D model. Play with it above - when you're ready, scroll down to learn how I did it.
{% end %}-->

Have you ever seen your brain peeking out from behind your translucent skull, with your frontal lobe slightly visible through your empty eye sockets?

{% figure(src="skull.gif", alt="A rotating, semi-translucent 3D model of a skull.") %}
Well, I have!
{% end %}

It turns out that when you get an MRI for a research study, they send you the raw DICOM data. However, the default viewer that they tell you to use is really only useful for radiologists. For the rest of us, it's just a bit creepy.

However, when I received the raw data, I wanted to see what I could do with it. Quite a lot, it turns out. In this post, I'll go over how I turned my raw MRI scan into the interactive graphic you're seeing above, plus some other interesting data I was able to extract.

## The raw scan 

I received my MRI scan in NIfTI format, which is a raster file format for storing neuroimaging data. My specific scanner had a field strength of 7 Tesla, which is quite a lot stronger than the ~1.5T they use in hospitals. [^1]

[^1]: Unfortunately, even though NIfTI supports 4-dimensional (3D + time) neuroimaging, I wasn't able to source longitudinal data from the researchers.

I was also provided a link to a [rudimentary online DICOM viewer](https://socr.umich.edu/HTML5/BrainViewer/). This let me view the MRI as a radiologist would, slice-by-slice, with some basic volume rendering.

{% carousel() %}
    {% carousel_item(src="umich-slices.png", alt="Sketchy DDx") %}
    The default view creates a 3D representation by aligning the axial, coronal and saggital views in their respective planes.
    {% end %}

    {% carousel_item(src="umich-3d.png", alt="Stanford ML") %}
    The 3D view generates a point cloud from the opacities in the MRI and shows a representation of the entire scan. This fails to adequately segment the brain, so you just end up seeing your translucent skull.
    {% end %}
{% end %}

This felt unsatisfying to me. I knew that, if a radiologist looked at my scan, they would be able to visualise the various structures inside my head that contributed to making me who I am. However, as a medical student (who wasn't the best at neuroanatomy), I didn't have the same intuition. 

In this blog post, I'll walk you through how I **a)** labelled the structures inside my brain and **b)** turned that data into something pleasant and intuitive to explore.
